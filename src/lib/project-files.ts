
// This file is a stand-in for reading the project structure dynamically.
// In a real scenario, this would be populated by a build script or a file system API.

export const ALL_FILES: Record<string, string> = {
  "/src/ai/flows/audit-trail-ai.ts": `'use server';

/**
 * @fileOverview A flow for summarizing audit logs and identifying unusual activity patterns.
 *
 * - auditTrailAISummarization - A function that handles the audit log summarization process.
 * - AuditTrailAISummarizationInput - The input type for the auditTrailAISummarization function.
 * - AuditTrailAISummarizationOutput - The return type for the auditTrailAISummarization function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AuditTrailAISummarizationInputSchema = z.object({
  auditLogs: z
    .string()
    .describe('The audit logs to summarize.'),
});
export type AuditTrailAISummarizationInput = z.infer<typeof AuditTrailAISummarizationInputSchema>;

const AuditTrailAISummarizationOutputSchema = z.object({
  summary: z.string().describe('A summary of the audit logs.'),
  unusualActivities: z.string().describe('Identified unusual activity patterns.'),
});
export type AuditTrailAISummarizationOutput = z.infer<typeof AuditTrailAISummarizationOutputSchema>;

const prompt = ai.definePrompt({
  name: 'auditTrailAISummarizationPrompt',
  input: {schema: AuditTrailAISummarizationInputSchema},
  output: {schema: AuditTrailAISummarizationOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: \`You are a security analyst specializing in identifying unusual activity patterns.

You will use the provided audit logs to identify and summarize the security events, and any unusual activity patterns.

Audit Logs: {{{auditLogs}}}\`,
});

const auditTrailAISummarizationFlow = ai.defineFlow(
  {
    name: 'auditTrailAISummarizationFlow',
    inputSchema: AuditTrailAISummarizationInputSchema,
    outputSchema: AuditTrailAISummarizationOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("Failed to get a response from the AI.");
    }
    return output;
  }
);


export async function auditTrailAISummarization(input: AuditTrailAISummarizationInput): Promise<AuditTrailAISummarizationOutput> {
  return auditTrailAISummarizationFlow(input);
}
`,
  "/src/ai/flows/config-validator-flow.ts": `'use server';

/**
 * @fileOverview A flow for validating system configurations using AI, specializing in medical compliance.
 *
 * - validateConfiguration - A function that handles the configuration validation process.
 * - ValidateConfigurationInput - The input type for the validateConfiguration function.
 * - ValidateConfigurationOutput - The return type for the validateConfiguration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateConfigurationInputSchema = z.object({
  config: z
    .string()
    .describe('The configuration file content to validate, likely a compliance matrix.'),
});
export type ValidateConfigurationInput = z.infer<typeof ValidateConfigurationInputSchema>;

const ValidateConfigurationOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the configuration is valid and compliant.'),
  suggestions: z.string().describe('Suggestions for improving the configuration, reasons for failure, or a confirmation of compliance.'),
});
export type ValidateConfigurationOutput = z.infer<typeof ValidateConfigurationOutputSchema>;

export async function validateConfiguration(input: ValidateConfigurationInput): Promise<ValidateConfigurationOutput> {
  return configValidatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'configValidatorPrompt',
  input: {schema: ValidateConfigurationInputSchema},
  output: {schema: ValidateConfigurationOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: \`You are a top-tier security and compliance analyst specializing in medical system configurations. Your task is to analyze the provided configuration, such as a compliance matrix, and determine if it is valid, secure, and compliant with standards like HIPAA and GDPR.

The configuration should be valid JSON. More importantly, it must be secure and well-formed.

Based on your analysis, set 'isValid' to true or false.
- If it's invalid or non-compliant, provide a detailed, actionable explanation in the 'suggestions' field explaining exactly what is wrong and how to fix it.
- If it is valid and compliant, confirm this in the 'suggestions' field and suggest potential improvements for security, performance, or readability.

Analyze the following configuration:
\\\`\\\`\\\`json
{{{config}}}
\\\`\\\`\\\`
\`,
});

const configValidatorFlow = ai.defineFlow(
  {
    name: 'configValidatorFlow',
    inputSchema: ValidateConfigurationInputSchema,
    outputSchema: ValidateConfigurationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
`,
  "/src/app/page.tsx": `'use client';

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { domainData } from "@/lib/domains";
import AppLayout from "@/components/layout/AppLayout";
import RecentActivity from "@/components/dashboard/RecentActivity";
import RoleSelector from "@/components/dashboard/RoleSelector";
import { cn } from "@/lib/utils";
import IntelligenceMap from "@/components/dashboard/IntelligenceMap";
import VisualIntegrityDashboard from "@/components/dashboard/VisualIntegrityDashboard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { domainFinancials } from "@/lib/financial-data";
import { TrendingUp, Coins, Shield, BarChartHorizontal } from 'lucide-react';
import RevenueMetrics from "@/components/dashboard/RevenueMetrics";
import RevenueChart from "@/components/dashboard/RevenueChart";
import CurrencySignalModule from "@/components/dashboard/CurrencySignalModule";
import PortAudit from "@/components/dashboard/PortAudit";
import { Suspense } from "react";
import ClientOnly from "@/components/layout/ClientOnly";
import MeshHydrationAudit from "@/components/dashboard/MeshHydrationAudit";
import OmegaEpochStream from "@/components/dashboard/OmegaEpochStream";


const getStatusColor = (status: string) => {
  if (status.includes("Optimal")) return "bg-green-500";
  if (status.includes("Warning")) return "bg-yellow-500";
  if (status.includes("Error")) return "bg-red-500";
  return "bg-gray-500";
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(value);
};

function DashboardContent() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-primary-foreground">
            Strategist HUD
          </h1>
          <RoleSelector />
        </div>

        <div className="space-y-4">
          <RevenueMetrics />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-4">
              <RevenueChart />
            </div>
             <div className="lg:col-span-3">
              <CurrencySignalModule />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-3">
                <IntelligenceMap />
            </div>
            <div className="lg:col-span-2">
                <VisualIntegrityDashboard />
            </div>
        </div>
        
         <div className="grid gap-4">
            <OmegaEpochStream />
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary-foreground mb-4">Domains</h2>
           <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent>
                {domainData.map((domain) => {
                  const financials = domainFinancials[domain.slug];
                  return (
                    <CarouselItem key={domain.slug} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                       <div className="p-1">
                          <Link key={domain.slug} href={\`/domain/\${domain.slug}\`} className="block">
                            <Card key={domain.slug} className="min-h-[16rem] transform transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:border-accent flex flex-col justify-between">
                              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="flex flex-col">
                                  <CardTitle as="h3" className="text-base font-semibold flex items-center gap-2">
                                    <domain.icon className="h-5 w-5 text-accent" />
                                    {domain.name}
                                  </CardTitle>
                                  <p className="text-xs text-muted-foreground pt-1">
                                    {domain.modules.length} modules
                                  </p>
                                </div>
                                <Badge variant="outline" className="flex items-center gap-2 text-xs">
                                  <span
                                      className={cn(
                                        "h-2 w-2 rounded-full",
                                        getStatusColor(domain.status)
                                      )}
                                    />
                                  <span>{domain.status.split(":")[0]}</span>
                                </Badge>
                              </CardHeader>
                              <CardContent>
                                  <div className="flex flex-wrap gap-1 mb-4">
                                    {domain.modules.slice(0,3).map(module => (
                                        <Badge key={module} variant="secondary" className="text-xs">{module}</Badge>
                                    ))}
                                    {domain.modules.length > 3 && <Badge variant="outline" className="text-xs">+{domain.modules.length-3} more</Badge>}
                                  </div>
                                  {financials && (
                                    <div className="text-xs text-muted-foreground space-y-1.5 pt-2 border-t border-border/50">
                                      <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5"><Coins className="h-3 w-3 text-amber-400" /> Revenue</span>
                                        <span className="font-mono text-foreground">{formatCurrency(financials.revenue)}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5"><BarChartHorizontal className="h-3 w-3 text-red-400" /> Cost</span>
                                        <span className="font-mono text-foreground">{formatCurrency(financials.cost)}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5"><TrendingUp className="h-3 w-3 text-green-400" /> ROI</span>
                                        <span className="font-mono text-foreground">{financials.roi.toFixed(1)}x</span>
                                      </div>
                                    </div>
                                  )}
                              </CardContent>
                            </Card>
                          </Link>
                       </div>
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
              <CarouselPrevious className="absolute left-[-20px] top-1/2 -translate-y-1/2" />
              <CarouselNext className="absolute right-[-20px] top-1/2 -translate-y-1/2" />
            </Carousel>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentActivity />
            </div>
            <div className="space-y-4">
              <PortAudit />
              <ClientOnly>
                <MeshHydrationAudit />
              </ClientOnly>
            </div>
        </div>
      </div>
    </AppLayout>
  )
}


export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientOnly>
        <DashboardContent />
      </ClientOnly>
    </Suspense>
  )
}
`,
  "/src/lib/utils.ts": `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\\s+/g, '-') // Replace spaces with -
    .replace(/[^\\w\\-]+/g, '') // Remove all non-word chars
    .replace(/\\-\\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}
`,
};
