import { useState } from 'react';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, Globe, ClipboardPaste } from 'lucide-react';

const importRsdReleases = httpsCallable<ImportRequest, ImportResult>(functions, 'importRsdReleases');

interface ImportResult {
  eventId: string;
  eventName: string;
  releaseCount: number;
  message: string;
}

interface ImportRequest {
  url?: string;
  pasteData?: string;
  eventName: string;
  year: number;
  season: 'spring' | 'fall';
  releaseDate: string;
}

export function CreateEventDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importMode, setImportMode] = useState<'url' | 'paste'>('url');

  // Form fields
  const [eventName, setEventName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [season, setSeason] = useState<'spring' | 'fall'>('spring');
  const [releaseDate, setReleaseDate] = useState('');
  const [url, setUrl] = useState('');
  const [pasteData, setPasteData] = useState('');

  function resetForm() {
    setEventName('');
    setYear(new Date().getFullYear().toString());
    setSeason('spring');
    setReleaseDate('');
    setUrl('');
    setPasteData('');
    setLoading(false);
  }

  async function handleImport() {
    const yearNum = parseInt(year, 10);
    if (!eventName || isNaN(yearNum) || !releaseDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (importMode === 'url' && !url) {
      toast.error('Please enter a URL to scrape');
      return;
    }

    if (importMode === 'paste' && !pasteData.trim()) {
      toast.error('Please paste the release data');
      return;
    }

    setLoading(true);

    try {
      const result = await importRsdReleases({
        url: importMode === 'url' ? url : undefined,
        pasteData: importMode === 'paste' ? pasteData : undefined,
        eventName,
        year: yearNum,
        season,
        releaseDate,
      });

      toast.success(result.data.message);

      // Invalidate queries so the new event/releases show up
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      await queryClient.invalidateQueries({ queryKey: ['releases'] });

      resetForm();
      setOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Import failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Create New List
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import RSD Releases</DialogTitle>
          <DialogDescription>
            Create a new RSD event and import releases by scraping the Record Store Day website or
            pasting the release data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Event metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium">Event Name *</label>
              <Input
                placeholder="Record Store Day 2026"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Year *</label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min={2020}
                max={2030}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Season *</label>
              <Select value={season} onValueChange={(v) => setSeason(v as 'spring' | 'fall')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spring">Spring (April)</SelectItem>
                  <SelectItem value="fall">Fall (Black Friday)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium">Release Date *</label>
              <Input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
          </div>

          {/* Import mode tabs */}
          <Tabs value={importMode} onValueChange={(v) => setImportMode(v as 'url' | 'paste')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Scrape URL
              </TabsTrigger>
              <TabsTrigger value="paste" className="gap-1.5">
                <ClipboardPaste className="h-3.5 w-3.5" />
                Paste Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-2 pt-2">
              <Input
                placeholder="https://recordstoreday.com/SpecialReleases?view=all"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use <code className="font-mono">?view=all</code> to get all releases on one page. If
                the site blocks scraping (WAF), use the &ldquo;Paste Data&rdquo; tab instead.
              </p>
            </TabsContent>

            <TabsContent value="paste" className="space-y-2 pt-2">
              <Textarea
                placeholder={
                  'TITLE\tARTIST\tLABEL\tFORMAT\tRELEASE TYPE\tQUANTITY\nWe Are Not Live\t13th Floor Elevators\tCharly Records\tLP\tRSD Exclusive\t2000'
                }
                value={pasteData}
                onChange={(e) => setPasteData(e.target.value)}
                rows={8}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Paste tab-separated data. Copy the full table from the RSD website (select all rows,
                Ctrl+C, paste here).
              </p>
            </TabsContent>
          </Tabs>

          {/* Preview count */}
          {importMode === 'paste' && pasteData.trim() && (
            <Badge variant="secondary" className="text-xs">
              {
                pasteData
                  .split('\n')
                  .filter((l) => l.trim() && !l.toUpperCase().startsWith('TITLE')).length
              }{' '}
              releases detected
            </Badge>
          )}

          {/* Action */}
          <Button className="w-full" onClick={handleImport} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Import Releases
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
