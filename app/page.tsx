"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";

// Define the schema with a custom refinement for file validation
const formSchema = z.object({
  orgId: z.string().min(4, {
    message: "Organization ID is required",
  }),
  issueId: z.string().min(4, {
    message: "",
  }),
  issueTitle: z.string().min(10, {
    message: "Issue title must be at least 10 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  category: z.string().nonempty({
    message: "Category is required.",
  }),
  // Using a custom refinement to validate files in the browser environment
  file: z
    .custom<FileList>()
    .optional()
    .refine((files) => {
      if (typeof window !== "undefined" && files) {
        return files.length > 0;
      }
      return true;
    }, {
      message: "Please select at least one file.",
    }),
});

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [issueId, setIssueId] = useState("");
  const { data: session, status } = useSession();
  const [issueDetails, setIssueDetails] = useState<any | null>(null);
  const [error, setError] = useState("");
  const generateUniqueString = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "sp";
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orgId: "",
      issueTitle: "",
      issueId: generateUniqueString(),
      description: "",
      category: "",
    },
  });

  const fileRef = form.register("file");

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("oid", data.orgId);
    formData.append("issue_title", data.issueTitle);
    formData.append("issue_description", data.description);
    formData.append("category", data.category);
    formData.append("issueId", data.issueId);
    if (data.file && data.file.length > 0) {
      for (let i = 0; i < data.file.length; i++) {
        formData.append("attachments", data.file[i]);
      }
    }

    setLoading(true);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "issues/create", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      const result = await response.json();
      console.log("Form submitted successfully", result);
    } catch (error) {
      console.error("Error submitting form", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchIssue = async () => {
    // Construct the API URL with optional orgId query parameter
    let apiUrl = process.env.NEXT_PUBLIC_BASE_URL + "issues/get";
    apiUrl += `?issueId=${issueId}`;
    console.log("🚀 ~ file: page.tsx:216 ~ fetchIssues ~ session:", session);

    try {
      // Make an API call to fetch issues
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch issues");
      }

      const data = await response.json();
      setIssueDetails(data[0]);
      setError("");
    } catch (error) {
      setIssueDetails(null);
      setError("Issue not found");
    }
  };

  const { control, handleSubmit, register, watch } = form;
  return (
    <main className="p-[40px]">
      <div className="mainTitle h-[100px] flex items-center justify-center text-[40px] font-bold text-[#242424] dark:text-[#fafafa]">
        What is your Issue?
      </div>
      <div className="mainBody flex w-full h-full flex-col items-center justify-center p-10 gap-[12px]">
        <div className="issueExists w-[650px] flex justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <p className="text-[#0a8537] cursor-pointer">
                Already have an issue Id? View issue now.
              </p>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>View Issue Details</DialogTitle>
                <DialogDescription>
                  Enter the Issue ID to view the details of the issue.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="issueId" className="sr-only">
                    Issue ID
                  </Label>
                  <Input
                    id="issueId"
                    value={issueId}
                    onChange={(e) => setIssueId(e.target.value)}
                    placeholder="Enter Issue ID"
                  />
                </div>
                <Button onClick={handleFetchIssue} size="sm" className="px-3">
                  Fetch
                </Button>
              </div>
              {error && <p className="text-red-500 mt-4">{error}</p>}
              {issueDetails && (
                <div className="mt-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="border-b pb-2">Field</th>
                        <th className="border-b pb-2">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border-b py-2">Title</td>
                        <td className="border-b py-2">{issueDetails.title}</td>
                      </tr>
                      <tr>
                        <td className="border-b py-2">Description</td>
                        <td className="border-b py-2">
                          {issueDetails.description}
                        </td>
                      </tr>
                      <tr>
                        <td className="border-b py-2">Category</td>
                        <td className="border-b py-2">
                          {issueDetails.category}
                        </td>
                      </tr>
                      <tr>
                        <td className="border-b py-2">Status</td>
                        <td className="border-b py-2">{issueDetails.status}</td>
                      </tr>
                      <tr>
                        <td className="border-b py-2">Reason</td>
                        <td className="border-b py-2">{issueDetails.reason}</td>
                      </tr>
                      {/* Add more fields as needed */}
                    </tbody>
                  </table>
                </div>
              )}
              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <Button
                    onClick={(e) => {
                      setIssueDetails(null);
                      setIssueId("");
                    }}
                    type="button"
                    variant="secondary"
                  >
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="form flex items-center justify-center p-10 border rounded-lg border-[#e3e3e3] dark:border-[#949494] w-[650px] h-full">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="insideForm w-full h-full flex items-center justify-center flex-col gap-4"
            >
              <div className="formItem w-full">
                <FormField
                  control={form.control}
                  name="orgId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Organization ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="formItem w-full">
                <FormField
                  control={form.control}
                  name="issueId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Issue ID" {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="formItem w-full">
                <FormField
                  control={form.control}
                  name="issueTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Issue Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="formItem w-full">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Type your description here."
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="formItem w-full">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Controller
                          control={control}
                          name="category"
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Category</SelectLabel>
                                  <SelectItem value="HR">HR</SelectItem>
                                  <SelectItem value="Management">
                                    Management
                                  </SelectItem>
                                  <SelectItem value="IT">IT</SelectItem>
                                  <SelectItem value="Sales">Sales</SelectItem>
                                  <SelectItem value="Marketing">
                                    Marketing
                                  </SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="formItem w-full">
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attachments</FormLabel>
                      <FormControl>
                        <Input
                          id="attachments"
                          type="file"
                          {...fileRef}
                          multiple
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </main>
  );
}
