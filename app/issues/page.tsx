"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  TableMeta,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { useEffect, useState } from "react";
// Define the issue type
export type Issue = {
  _id: string;
  title: string;
  issueId: string;
  description: string;
  category: string;
  attachments: string[];
  created_at: string;
  status: string;
};

// Function to determine badge styles based on status
const getStatusBadgeStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "resolved":
      return "bg-green-100 text-green-800"; // Green for resolved
    case "invalid":
      return "bg-red-100 text-red-800"; // Red for invalid
    case "priority":
      return "bg-yellow-100 text-yellow-800"; // Yellow for priority
    case "open":
      return "bg-blue-100 text-blue-800"; // Blue for open
    default:
      return "bg-gray-100 text-gray-800"; // Default style for other statuses
  }
};

// ActionDialog component
function ActionDialog({
  issueId,
  action,
  open,
  onClose,
}: {
  issueId: string;
  action: string;
  open: boolean;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");

  const handleSubmit = async () => {
    try {
      const apiEndpoint = `${process.env.NEXT_PUBLIC_BASE_URL}issues/status`;
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason, issueId, status: action }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} the issue`);
      }

      const result = await response.json();
      console.log(`${action} action successful`, result);
      onClose();
    } catch (error) {
      console.error(`Error executing ${action} action`, error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{`Enter Reason to ${action}`}</DialogTitle>
          <DialogDescription>
            Provide a reason for why you are marking this issue as {action}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Label htmlFor="reason">Reason</Label>
          <Input
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={`Enter reason to ${action}`}
          />
        </div>
        <DialogFooter className="sm:justify-start">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ActionsCell component
const ActionsCell: React.FC<{ issue: Issue; table: any }> = ({ issue, table }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState("");

  const handleActionClick = (action: string) => {
    setCurrentAction(action);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    table.options.meta?.refreshData(); // Refresh data when dialog closes
  };

  const status = issue.status.toLowerCase();
  const isActionable = ["invalid", "open", "priority"].includes(status);

  return (
    <>
      {isActionable && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {status !== "resolved" && (
              <DropdownMenuItem onClick={() => handleActionClick("resolved")}>
                Mark as resolved
              </DropdownMenuItem>
            )}
            {status !== "invalid" && (
              <DropdownMenuItem onClick={() => handleActionClick("invalid")}>
                Mark as invalid
              </DropdownMenuItem>
            )}
            {status !== "priority" && (
              <DropdownMenuItem onClick={() => handleActionClick("priority")}>
                Mark as priority
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {dialogOpen && (
        <ActionDialog
          issueId={issue.issueId}
          action={currentAction}
          open={dialogOpen}
          onClose={handleDialogClose}
        />
      )}
    </>
  );
};

// Component for displaying the table of issues
export default function DataTableDemo() {
  const [data, setData] = React.useState<Issue[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const { data: session, status } = useSession();

  // Fetch issues from the API
  const fetchIssues = React.useCallback(async () => {
    console.log("🚀 ~ file: page.tsx:99 ~ fetchIssues ~ process.env:", process.env);

    try {
      let apiUrl = process.env.NEXT_PUBLIC_BASE_URL + "issues/get";

      if (session?.user?.oid) {
        apiUrl += `?orgId=${session.user.oid}`;
      }

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch issues");
      }

      const issues = await response.json();
      setData(issues);
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  }, [session]);

  // Update the issues state when the API call is complete
  useEffect(() => {
    if (status === "authenticated" && session?.user?.oid) {
      fetchIssues();
    }
  }, [status, session, fetchIssues]);

  const columns: ColumnDef<Issue>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div>
          <span>{row.getValue("title")}</span>
        </div>
      ),
    },
    {
      accessorKey: "issueId",
      header: "Issue Id",
      cell: ({ row }) => <div>{row.getValue("issueId")}</div>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        // Assert that the value is of type string
        const status = row.getValue("status") as string;
        
        return (
          <div>
            <Badge
              variant="outline"
              className={`flex items-center justify-center ${getStatusBadgeStyle(
                status
              )}`}
            >
              {status.toUpperCase()}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Description
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("description")}</div>,
    },
    {
      accessorKey: "category",
      header: () => <div className="text-right">Category</div>,
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">{row.getValue("category")}</div>
        );
      },
    },
    {
      accessorKey: "attachments",
      header: "Attachments",
      cell: ({ row }) => {
        const attachments = row.getValue("attachments") as string[];
        return (
          <div>
            {attachments.map((attachment, index) => (
              <a
                key={index}
                href={attachment}
                target="_blank"
                rel="noopener noreferrer"
              >
                Attachment {index + 1}
              </a>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => (
        <div>
          {new Date(row.getValue("created_at")).toLocaleString("en-US", {
            hour12: true,
          })}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row, table }) => <ActionsCell issue={row.original} table={table} />,
    },
  ];

  const table = useReactTable<Issue>({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      refreshData: fetchIssues, // Define refreshData as a method in meta
    } as TableMeta<Issue>,
  });

  return (
    <div className="w-full p-[40px] ">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter titles..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}