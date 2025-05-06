// src/pages/Admin.tsx

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/useLanguage";
import MainLayout from "@/layout/MainLayout";
import { db } from "@/lib/firebase";
import axios from "axios";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { Eye, FileUp, Loader2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Replace with your Cloudinary configuration from the environment variables
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

interface TaxForm {
  id: string;
  name: string;
  description: string;
  year: number;
  type: string;
  createdAt: string;
  pdfUrl?: string;
}

const Admin = () => {
  const [forms, setForms] = useState<TaxForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formYear, setFormYear] = useState(new Date().getFullYear());
  const [formType, setFormType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  // Fetch forms on component mount
  useEffect(() => {
    fetchForms();
  }, []);

  // Fetch forms from Firestore
  const fetchForms = async () => {
    try {
      setLoading(true);
      const formsSnapshot = await getDocs(collection(db, "forms"));
      const formsList: TaxForm[] = [];

      formsSnapshot.forEach((doc) => {
        const formData = doc.data() as Omit<TaxForm, "id">;
        formsList.push({
          id: doc.id,
          ...formData,
        });
      });

      // Sort by year (descending) and then by name
      formsList.sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year;
        }
        return a.name.localeCompare(b.name);
      });

      setForms(formsList);
    } catch (error) {
      console.error("Error fetching forms:", error);
      toast.error(t("admin.fetchError"), {
        description: t("admin.error"),
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload new form
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !formName || !formType) {
      toast.error(t("admin.formIncomplete"), {
        description: t("admin.fillAllFields"),
      });
      return;
    }

    try {
      setUploading(true);

      // 1. First, upload to Cloudinary
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      // Log the upload attempt
      console.log("Attempting to upload to Cloudinary...");

      const cloudinaryResponse = await axios.post(
        CLOUDINARY_UPLOAD_URL,
        formData
      );

      // Log successful upload
      console.log("Cloudinary upload successful:", cloudinaryResponse.data);

      const pdfUrl = cloudinaryResponse.data.secure_url;

      // 2. Then save metadata + URL to Firestore
      const formDoc = await addDoc(collection(db, "forms"), {
        name: formName,
        description: formDescription,
        year: formYear,
        type: formType,
        createdAt: new Date().toISOString(),
        pdfUrl: pdfUrl, // Store the Cloudinary URL
      });

      console.log("Document written with ID: ", formDoc.id);

      // 3. Reset form
      setFormName("");
      setFormDescription("");
      setFormYear(new Date().getFullYear());
      setFormType("");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // 4. Close dialog and refresh forms list
      setIsDialogOpen(false);

      toast.success(t("admin.success"), {
        description: t("admin.formUploaded"),
      });

      // 5. Refresh forms list
      fetchForms();
    } catch (error) {
      console.error("Error uploading form:", error);

      // More detailed error logging
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", error.response?.data);
      }

      toast.error(t("admin.error"), {
        description: t("admin.uploadError"),
      });
    } finally {
      setUploading(false);
    }
  };

  // Delete form
  const handleDelete = async (formId: string) => {
    if (!confirm(t("admin.confirmDelete"))) {
      return;
    }

    try {
      setLoading(true);

      // 1. Get the form document to find the Cloudinary URL
      const formDoc = await getDoc(doc(db, "forms", formId));
      const formData = formDoc.data() as TaxForm;

      // 2. Delete from Cloudinary (if URL exists)
      if (formData && formData.pdfUrl) {
        // Note: Properly deleting from Cloudinary requires a server-side component
        // This is a simplified example and would need a more secure implementation
        // for production use

        // Extract the public_id from the URL
        const urlParts = formData.pdfUrl.split("/");
        const fileNameWithExtension = urlParts[urlParts.length - 1];
        const publicId = fileNameWithExtension.split(".")[0];

        console.log("Should delete from Cloudinary with public_id:", publicId);
        // For proper implementation, you'd use a server API route to delete securely

        // Example server code:
        // await axios.post('/api/cloudinary/delete', { public_id: publicId });
      }

      // 3. Delete from Firestore
      await deleteDoc(doc(db, "forms", formId));

      // 4. Update local state
      setForms(forms.filter((form) => form.id !== formId));

      toast.success(t("admin.deleted"), {
        description: t("admin.formDeleted"),
      });
    } catch (error) {
      console.error("Error deleting form:", error);
      toast.error(t("admin.error"), {
        description: t("admin.deleteError"),
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      toast.error(t("admin.invalidFile"), {
        description: t("admin.pdfOnly"),
      });
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t("admin.title")}</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileUp className="mr-2 h-4 w-4" />
                {t("admin.uploadForm")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("admin.newForm")}</DialogTitle>
                <DialogDescription>
                  {t("admin.uploadDescription")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="formName">{t("admin.formName")}</Label>
                  <Input
                    id="formName"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Modelo 100"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formDescription">
                    {t("admin.formDescription")}
                  </Label>
                  <Textarea
                    id="formDescription"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder={t("admin.descriptionPlaceholder")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="formYear">{t("admin.year")}</Label>
                    <Input
                      id="formYear"
                      type="number"
                      value={formYear}
                      onChange={(e) => setFormYear(parseInt(e.target.value))}
                      min={2000}
                      max={2100}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formType">{t("admin.type")}</Label>
                    <Input
                      id="formType"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      placeholder="IRPF"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formFile">{t("admin.pdfFile")}</Label>
                  <Input
                    ref={fileInputRef}
                    id="formFile"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("admin.uploading")}
                      </>
                    ) : (
                      t("admin.upload")
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.manageForms")}</CardTitle>
            <CardDescription>{t("admin.manageDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : forms.length > 0 ? (
              <Table>
                <TableCaption>{t("admin.tableCaption")}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.tableName")}</TableHead>
                    <TableHead>{t("admin.tableType")}</TableHead>
                    <TableHead>{t("admin.tableYear")}</TableHead>
                    <TableHead className="text-right">
                      {t("admin.tableActions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell className="font-medium">{form.name}</TableCell>
                      <TableCell>{form.type}</TableCell>
                      <TableCell>{form.year}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="icon" asChild>
                            <a
                              href={`/form/${form.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(form.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">{t("admin.noForms")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Admin;
