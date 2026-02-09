import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useEnableShare,
  useDisableShare,
  useShareInfo,
  useUpdateShareInfo,
} from '@/hooks/useSharedList';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Loader2 } from 'lucide-react';
import shareIcon from '@/images/share.svg';

interface ShareListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareListDialog({ open, onOpenChange }: ShareListDialogProps) {
  const { user, firebaseUser } = useAuth();
  const enableShare = useEnableShare();
  const disableShare = useDisableShare();
  const updateShareInfo = useUpdateShareInfo();

  const isSharing = !!user?.sharingEnabled && !!user?.shareId;

  const { data: shareInfo } = useShareInfo(isSharing ? user?.shareId : null);

  const defaultListName = `${user?.displayName ?? 'My'}'s RSD List`;
  const [listName, setListName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [copied, setCopied] = useState(false);

  const shareUrl = user?.shareId ? `${window.location.origin}/shared/${user.shareId}` : '';

  function handleEnableShare() {
    if (!firebaseUser) return;
    const name = listName.trim() || defaultListName;
    enableShare.mutate(
      { ownerName: user?.displayName ?? 'Anonymous', listName: name },
      { onSuccess: () => setListName('') }
    );
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy link');
    }
  }

  function handleUpdateName() {
    if (!user?.shareId || !editName.trim()) return;
    updateShareInfo.mutate(
      {
        shareId: user.shareId,
        listName: editName.trim(),
        ownerName: shareInfo?.ownerName ?? user?.displayName ?? 'Anonymous',
      },
      { onSuccess: () => setEditingName(false) }
    );
  }

  function handleDisableShare() {
    if (!user?.shareId) return;
    disableShare.mutate(user.shareId);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setEditingName(false);
      setListName('');
      setCopied(false);
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img src={shareIcon} alt="" className="h-5 w-5" />
            Share Your List
          </DialogTitle>
          <DialogDescription>
            {isSharing
              ? 'Your list is currently shared. Anyone with the link can view it.'
              : 'Share a read-only version of your want list with friends.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {!isSharing ? (
            /* --- Not sharing yet --- */
            <>
              <div className="space-y-1.5">
                <label htmlFor="share-list-name" className="text-sm font-medium">
                  List Name
                </label>
                <Input
                  id="share-list-name"
                  placeholder={defaultListName}
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <Button
                onClick={handleEnableShare}
                disabled={enableShare.isPending}
                className="w-full"
              >
                {enableShare.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <img src={shareIcon} alt="" className="h-4 w-4 mr-2" />
                )}
                Share My List
              </Button>
            </>
          ) : (
            /* --- Already sharing --- */
            <>
              {/* Shareable URL */}
              <div className="space-y-1.5">
                <label htmlFor="share-link" className="text-sm font-medium">
                  Shareable Link
                </label>
                <div className="flex gap-2">
                  <Input
                    id="share-link"
                    value={shareUrl}
                    readOnly
                    className="font-mono text-xs rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    aria-label="Copy link"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Edit list name */}
              <div className="space-y-1.5">
                <label htmlFor="edit-list-name" className="text-sm font-medium">
                  List Name
                </label>
                {!editingName ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#B3B3B3]">{shareInfo?.listName ?? '...'}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditName(shareInfo?.listName ?? '');
                        setEditingName(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      id="edit-list-name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded-lg"
                    />
                    <Button
                      size="sm"
                      onClick={handleUpdateName}
                      disabled={updateShareInfo.isPending}
                    >
                      {updateShareInfo.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Save'
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingName(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Stop sharing */}
              <div className="pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisableShare}
                  disabled={disableShare.isPending}
                  className="w-full"
                >
                  {disableShare.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Stop Sharing
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
