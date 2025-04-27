// src/components/admin/RegistrationDetails.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X, Save, Edit, User } from "lucide-react";

interface Registration {
  id: string;
  student_id: string;
  student_name: string;
  email: string;
  phone: string;
  grade: string;
  school: string;
  parent_name: string;
  parent_phone: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

interface RegistrationDetailsProps {
  registration: Registration | null;
  onUpdate: (studentId: string, updates: Partial<Registration>) => void;
  onApprove: (studentId: string, approved: boolean) => void;
}

export function RegistrationDetails({ 
  registration, 
  onUpdate,
  onApprove
}: RegistrationDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Registration>>({});

  const handleEditToggle = () => {
    if (isEditing) {
      if (registration && Object.keys(editedData).length > 0) {
        onUpdate(registration.student_id, editedData);
      }
      setEditedData({});
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field: keyof Registration, value: string) => {
    setEditedData({ ...editedData, [field]: value });
  };

  const getValue = (field: keyof Registration) => {
    if (field in editedData) {
      return editedData[field];
    }
    return registration?.[field] || "";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  if (!registration) {
    return (
      <Card className="h-full">
        <CardHeader className="text-center">
          <CardTitle>Registration Details</CardTitle>
          <CardDescription>Select a registration to view details</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-gray-500 p-8">
          <User size={64} className="mb-4 opacity-30" />
          <p>No registration selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{registration.student_name}</CardTitle>
            <CardDescription>ID: {registration.student_id}</CardDescription>
          </div>
          <Badge variant={registration.approved ? "default" : "secondary"}>
            {registration.approved ? "Approved" : "Pending"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          {isEditing ? (
            <Input
              id="email"
              value={getValue("email") as string}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          ) : (
            <div className="py-2">{registration.email}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          {isEditing ? (
            <Input
              id="phone"
              value={getValue("phone") as string}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          ) : (
            <div className="py-2">{registration.phone}</div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="school">School</Label>
            {isEditing ? (
              <Input
                id="school"
                value={getValue("school") as string}
                onChange={(e) => handleInputChange("school", e.target.value)}
              />
            ) : (
              <div className="py-2">{registration.school}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            {isEditing ? (
              <Input
                id="grade"
                value={getValue("grade") as string}
                onChange={(e) => handleInputChange("grade", e.target.value)}
              />
            ) : (
              <div className="py-2">{registration.grade}</div>
            )}
          </div>
        </div>

        <Separator />

        <h3 className="text-sm font-medium">Parent Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="parent_name">Parent Name</Label>
          {isEditing ? (
            <Input
              id="parent_name"
              value={getValue("parent_name") as string}
              onChange={(e) => handleInputChange("parent_name", e.target.value)}
            />
          ) : (
            <div className="py-2">{registration.parent_name}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent_phone">Parent Phone</Label>
          {isEditing ? (
            <Input
              id="parent_phone"
              value={getValue("parent_phone") as string}
              onChange={(e) => handleInputChange("parent_phone", e.target.value)}
            />
          ) : (
            <div className="py-2">{registration.parent_phone}</div>
          )}
        </div>

        <Separator />

        <div className="text-xs text-gray-500">
          <div>Created: {formatDate(registration.created_at)}</div>
          <div>Last updated: {formatDate(registration.updated_at)}</div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleEditToggle}
          className="flex items-center gap-1"
        >
          {isEditing ? (
            <>
              <Save size={16} /> Save
            </>
          ) : (
            <>
              <Edit size={16} /> Edit
            </>
          )}
        </Button>
        
        <div className="flex gap-2">
          {!registration.approved ? (
            <Button 
              onClick={() => onApprove(registration.student_id, true)}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
            >
              <Check size={16} /> Approve
            </Button>
          ) : (
            <Button 
              variant="secondary"
              onClick={() => onApprove(registration.student_id, false)}
              className="flex items-center gap-1"
            >
              <X size={16} /> Revoke
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
