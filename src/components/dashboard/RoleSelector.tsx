
"use client";

import { useUser } from "@/hooks/use-user";
import { ROLES, type Role } from "@/lib/roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";

export default function RoleSelector() {
  const { user, setUserRole, loading } = useUser();

  if (loading || !user) {
    return (
        <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-[180px]" />
        </div>
    )
  }

  const handleRoleChange = (role: Role) => {
    setUserRole(role);
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="role-select" className="text-sm font-medium">Current Role:</Label>
      <Select onValueChange={handleRoleChange} value={user.role}>
        <SelectTrigger id="role-select" className="w-[180px]">
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
