'use client';

import {
  useListAiReports,
  useGenerateAiReport,
  getAiReportsQueryKey,
  useGetSettings,
} from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, FileText, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Fragment } from 'react';

export default function Reports() {
  const { data: settings } = useGetSettings();
  const isOwner = settings?.activeRole === 'owner';

  const { data: reports, isLoading } = useListAiReports();
  const generateReport = useGenerateAiReport();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (!isOwner) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
        <p className="text-muted-foreground">
          AI Business Reports contain sensitive financial analysis and are only available to the Shop Owner.
          Switch roles in Settings to access this feature.
        </p>
      </div>
    );
  }

  const handleGenerate = () => {
    generateReport.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "Report generated successfully" });
        queryClient.invalidateQueries({ queryKey: getAiReportsQueryKey() });
      },
      onError: (err) => {
        toast({ title: "Failed to generate report", description: String(err), variant: "destructive" });
      },
    });
  };

  const latestReport = reports?.[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            AI Business Reports
          </h1>
          <p className="text-muted-foreground mt-1">Intelligent analysis of your shop&apos;s performance, inventory, and trends.</p>
        </div>
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={generateReport.isPending}
          className="shadow-md bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 font-bold"
        >
          {generateReport.isPending ? 'Analyzing Data...' : 'Generate New Report'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-sm flex flex-col h-[calc(100vh-14rem)]">
          <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
            <CardTitle>Latest Analysis</CardTitle>
            {latestReport && (
              <p className="text-sm text-muted-foreground">Generated on {formatDate(latestReport.createdAt)}</p>
            )}
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent className="p-6 md:p-8">
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-6 w-3/4 bg-muted rounded" />
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-5/6 bg-muted rounded" />
                  <div className="h-32 w-full bg-muted rounded mt-8" />
                </div>
              ) : !latestReport ? (
                <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
                  <FileText className="w-12 h-12 mb-4 opacity-20" />
                  No reports generated yet. Click the button above to run your first analysis.
                </div>
              ) : (
                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-primary prose-headings:font-bold prose-p:leading-relaxed prose-li:my-1">
                  {latestReport.content.split('\n').map((para, i) => (
                    <Fragment key={i}>
                      {para}
                      <br />
                    </Fragment>
                  ))}
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border-border/50 shadow-sm flex-1">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base">History</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {reports?.slice(1).map(report => (
                    <div key={report.id} className="p-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{formatDate(report.createdAt)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 italic">
                        &ldquo;{report.content.substring(0, 100)}...&rdquo;
                      </p>
                    </div>
                  ))}
                  {reports?.length === 1 && (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      No older reports.
                    </div>
                  )}
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}
