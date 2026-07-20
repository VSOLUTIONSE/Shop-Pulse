'use client';

import { useState, useEffect, useRef } from 'react';
import {
  useGetSettings,
  useUpdateSettings,
  useImportBackup,
} from '@/lib/hooks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Save, Download, Upload, AlertTriangle } from 'lucide-react';
import { exportBackup } from '@/lib/hooks';

export default function SettingsPage() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const importBackup = useImportBackup();
  const [isExporting, setIsExporting] = useState(false);
  const [pendingImport, setPendingImport] = useState<File | null>(null);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    shopName: '',
    lowStockThreshold: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        shopName: settings.shopName,
        lowStockThreshold: settings.lowStockThreshold.toString(),
      });
    }
  }, [settings]);

  const handleSaveSettings = () => {
    updateSettings.mutate({
      shopName: formData.shopName,
      lowStockThreshold: Number(formData.lowStockThreshold),
    }).then(() => {
      toast({ title: "Settings saved successfully" });
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `shoppulse-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Backup exported successfully" });
    } catch (err) {
      toast({ title: "Export failed", description: String(err), variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImport(file);
    e.target.value = '';
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        importBackup.mutate(json, {
          onSuccess: () => toast({ title: "Backup restored successfully!" }),
          onError: (err) => toast({ title: "Restore failed", description: String(err), variant: "destructive" }),
        });
      } catch {
        toast({ title: "Invalid backup file", variant: "destructive" });
      }
    };
    reader.readAsText(pendingImport);
    setPendingImport(null);
  };

  if (isLoading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage business identity, roles, and data backups.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
            <CardDescription>Basic information for receipts and UI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              />
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <Label>Default Low Stock Threshold</Label>
              <Input
                type="number"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Global threshold used when creating products.</p>
            </div>

            <Button onClick={handleSaveSettings} disabled={updateSettings.isPending} className="w-full mt-2">
              <Save className="w-4 h-4 mr-2" /> Save Settings
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Backup & Restore</CardTitle>
            <CardDescription>Offline-first safety. Keep regular backups of your database.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 border border-border/50 rounded-xl bg-muted/10 space-y-3">
              <div>
                <h3 className="font-semibold text-sm">Export Data</h3>
                <p className="text-xs text-muted-foreground mt-1">Download a complete JSON snapshot of all products, sales, and ledgers.</p>
              </div>
              <Button variant="outline" className="w-full" onClick={handleExport} disabled={isExporting}>
                <Download className="w-4 h-4 mr-2" /> Download Backup
              </Button>
            </div>

            <div className="p-4 border border-destructive/20 rounded-xl bg-destructive/5 space-y-3">
              <div className="flex gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm text-destructive">Restore Data</h3>
                  <p className="text-xs text-destructive/80 mt-1">Upload a JSON backup file. This will completely overwrite the current database.</p>
                </div>
              </div>
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImportFile}
              />
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={importBackup.isPending}
              >
                <Upload className="w-4 h-4 mr-2" /> Restore from File
              </Button>

              <AlertDialog open={!!pendingImport} onOpenChange={(open) => { if (!open) setPendingImport(null); }}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Restore Backup?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will <strong>completely overwrite</strong> all current products, sales, expenses, and customer data with the backup contents. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmImport} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, Restore
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
