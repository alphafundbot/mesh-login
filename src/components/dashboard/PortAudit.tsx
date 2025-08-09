
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi } from "lucide-react";

const portData = [
    { port: 80, protocol: 'TCP', address: '0.0.0.0', role: 'HTTP Ingress' },
    { port: 6000, protocol: 'TCP', address: '0.0.0.0', role: 'Mesh Signal Relay' },
    { port: 9000, protocol: 'TCP', address: '0.0.0.0', role: 'Studio UI / HUD' },
    { port: 9002, protocol: 'TCP', address: '0.0.0.0', role: 'Override API' },
    { port: 9402, protocol: 'TCP', address: '0.0.0.0', role: 'Gemini API Proxy' },
];

export default function PortAudit() {
  return (
    <Card className="transition-shadow duration-300 hover:shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wifi className="h-6 w-6 text-accent" />
          <CardTitle>Port Audit Matrix</CardTitle>
        </div>
        <CardDescription>
          Live listeners and their assigned roles within the mesh network.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Port</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {portData.map((item) => (
              <TableRow key={item.port}>
                <TableCell className="font-mono">
                    {item.port}/{item.protocol}
                </TableCell>
                <TableCell>{item.role}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-green-400 border-green-400/50">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
