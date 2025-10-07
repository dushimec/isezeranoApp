
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Unauthorized</CardTitle>
          <CardDescription>
            You are not authorized to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please contact an administrator if you believe this is an error.</p>
        </CardContent>
      </Card>
    </div>
  );
}
