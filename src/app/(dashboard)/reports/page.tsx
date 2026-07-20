'use client';

import {
  useListAiReports,
  useGenerateAiReport,
} from '@/lib/hooks';
import { useRole } from '@/hooks/use-role';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, FileText, Lock, Brain, Flame, Gauge } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Fragment } from 'react';

export default function Reports() {
  const { isOwner, isLoaded } = useRole();

  const { data: reports, isLoading } = useListAiReports();
  const generateReport = useGenerateAiReport();
  const { toast } = useToast();

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  if (!isOwner) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
        <p className="text-muted-foreground">
          AI Business Reports are only available to the Owner.
        </p>
      </div>
    );
  }

  const handleGenerate = () => {
    generateReport.mutate(() => {
      toast({ title: "Report generated successfully" });
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
          <p className="text-muted-foreground mt-1">Intelligent analysis of your sales performance, inventory, and trends.</p>
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
            <CardTitle>{latestReport?.title ?? 'Latest Analysis'}</CardTitle>
            {latestReport && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                <span>{formatDate(latestReport.createdAt)}</span>
                {latestReport.model && (
                  <span className="flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    {latestReport.model}
                  </span>
                )}
                {latestReport.tokens != null && (
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3 h-3" />
                    {latestReport.tokens.toLocaleString()} tokens
                  </span>
                )}
                {latestReport.promptTokens != null && latestReport.completionTokens != null && (
                  <span className="text-muted-foreground/60">
                    (prompt: {latestReport.promptTokens.toLocaleString()} · completion: {latestReport.completionTokens.toLocaleString()})
                  </span>
                )}
              </div>
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
                      <div className="flex items-center gap-3 mb-1">
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="font-medium text-sm">{formatDate(report.createdAt)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground/70 line-clamp-1 font-medium mb-1">
                        {report.title ?? 'Business Report'}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 italic">
                        &ldquo;{report.content.replace(/^#+\s*/g, '').substring(0, 80)}...&rdquo;
                      </p>
                      {report.model && (
                        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground/50">
                          <Flame className="w-3 h-3" />
                          {report.model}
                          {report.tokens != null && (
                            <> · {report.tokens.toLocaleString()} tokens</>
                          )}
                        </div>
                      )}
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
