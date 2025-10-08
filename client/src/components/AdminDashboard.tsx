import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Lock, Unlock, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { decryptData } from "@/lib/encryptUtils";
import { useToast } from "@/hooks/use-toast";
import type { Application, ApplicationData } from "@shared/schema";

export default function AdminDashboard() {
  const [decryptedData, setDecryptedData] = useState<
    Record<string, ApplicationData>
  >({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Mock data for demo purposes
  //todo: remove mock functionality
  const mockApplications: Application[] = [
    {
      id: "app-001",
      encryptedData: "U2FsdGVkX1+encrypted-data-sample-1",
      iv: "random-iv-base64-1",
      submittedAt: new Date("2025-01-15T10:30:00"),
    },
    {
      id: "app-002",
      encryptedData: "U2FsdGVkX1+encrypted-data-sample-2",
      iv: "random-iv-base64-2",
      submittedAt: new Date("2025-01-16T14:20:00"),
    },
  ];

  const { data: applications = mockApplications, isLoading } = useQuery<
    Application[]
  >({
    queryKey: ["/api/applications"],
    //todo: remove mock functionality - replace with actual API call
    queryFn: () => Promise.resolve(mockApplications),
  });

  const handleDecrypt = async (application: Application) => {
    try {
      const decrypted = await decryptData(
        application.encryptedData,
        application.iv
      );
      setDecryptedData((prev) => ({ ...prev, [application.id]: decrypted }));
      toast({
        title: "Decryption Successful",
        description: "Application data has been decrypted",
      });
    } catch (error) {
      console.error("Decryption error:", error);
      toast({
        title: "Decryption Failed",
        description: "Could not decrypt this application",
        variant: "destructive",
      });
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold" data-testid="text-admin-title">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground" data-testid="text-admin-subtitle">
              Manage encrypted college applications
            </p>
          </div>
          <Badge variant="outline" className="text-sm" data-testid="badge-app-count">
            {applications.length} Applications
          </Badge>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.length === 0 ? (
            <Card className="p-12 text-center">
              <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground">
                Submitted applications will appear here
              </p>
            </Card>
          ) : (
            applications.map((application) => {
              const isDecrypted = !!decryptedData[application.id];
              const isExpanded = expandedRows.has(application.id);
              const data = decryptedData[application.id];

              return (
                <Card key={application.id} className="p-6" data-testid={`card-application-${application.id}`}>
                  <div className="space-y-4">
                    {/* Application Header */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-mono text-sm text-muted-foreground" data-testid={`text-app-id-${application.id}`}>
                            {application.id}
                          </p>
                          <Badge
                            variant={isDecrypted ? "default" : "secondary"}
                            className="text-xs"
                            data-testid={`badge-status-${application.id}`}
                          >
                            {isDecrypted ? (
                              <>
                                <Unlock className="w-3 h-3 mr-1" />
                                Decrypted
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 mr-1" />
                                Encrypted
                              </>
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground" data-testid={`text-submitted-${application.id}`}>
                          Submitted: {formatDate(application.submittedAt)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {!isDecrypted ? (
                          <Button
                            onClick={() => handleDecrypt(application)}
                            size="sm"
                            data-testid={`button-decrypt-${application.id}`}
                          >
                            <Unlock className="w-4 h-4 mr-2" />
                            Decrypt
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleExpand(application.id)}
                            data-testid={`button-toggle-${application.id}`}
                          >
                            {isExpanded ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 ml-1" />
                            ) : (
                              <ChevronDown className="w-4 h-4 ml-1" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Encrypted Data Preview */}
                    {!isDecrypted && (
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Lock className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Encrypted Data:
                            </p>
                            <p className="font-mono text-xs break-all text-muted-foreground" data-testid={`text-encrypted-${application.id}`}>
                              {application.encryptedData.substring(0, 80)}...
                            </p>
                            <p className="text-xs font-medium text-muted-foreground mt-2 mb-1">
                              IV (Initialization Vector):
                            </p>
                            <p className="font-mono text-xs text-muted-foreground" data-testid={`text-iv-${application.id}`}>
                              {application.iv}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Decrypted Data */}
                    {isDecrypted && isExpanded && data && (
                      <div className="space-y-4 border-t pt-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm">
                              Personal Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  Name
                                </p>
                                <p className="font-medium" data-testid={`text-decrypted-name-${application.id}`}>{data.name}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  Email
                                </p>
                                <p className="font-medium" data-testid={`text-decrypted-email-${application.id}`}>{data.email}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  Phone
                                </p>
                                <p className="font-medium" data-testid={`text-decrypted-phone-${application.id}`}>{data.phone}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm">
                              Academic Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  Course
                                </p>
                                <p className="font-medium" data-testid={`text-decrypted-course-${application.id}`}>{data.course}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  Department
                                </p>
                                <p className="font-medium" data-testid={`text-decrypted-department-${application.id}`}>{data.department}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  GPA
                                </p>
                                <p className="font-medium" data-testid={`text-decrypted-gpa-${application.id}`}>{data.gpa}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {data.documents && data.documents.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm">Documents</h4>
                            <div className="grid gap-2">
                              {data.documents.map((doc, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                  data-testid={`document-${application.id}-${index}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                                      <span className="text-xs font-mono text-primary">
                                        {doc.type.includes("pdf") ? "PDF" : "JPG"}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">
                                        {doc.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {(doc.size / 1024).toFixed(2)} KB
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
