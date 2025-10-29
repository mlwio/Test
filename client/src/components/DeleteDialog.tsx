import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComboBox } from "@/components/ui/combobox";
import type { ContentItem } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ContentItem[];
}

export function DeleteDialog({ open, onOpenChange, items }: DeleteDialogProps) {
  const [selectedItemId, setSelectedItemId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"select" | "confirm">("select");
  
  const queryClient = useQueryClient();
  
  const itemOptions = items.map((item) => ({
    value: item._id,
    label: `${item.title} (${item.category})`,
  }));

  const deleteMutation = useMutation({
    mutationFn: async (data: { id: string; username: string; password: string }) => {
      const response = await fetch(`/api/content/${data.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.username, password: data.password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete content");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      handleClose();
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleClose = () => {
    setSelectedItemId("");
    setUsername("");
    setPassword("");
    setError("");
    setStep("select");
    onOpenChange(false);
  };

  const handleNext = () => {
    if (!selectedItemId) {
      setError("Please select an item to delete");
      return;
    }
    setError("");
    setStep("confirm");
  };

  const handleDelete = () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    deleteMutation.mutate({ id: selectedItemId, username, password });
  };

  const selectedItem = items.find((item) => item._id === selectedItemId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent data-testid="dialog-delete">
        <DialogHeader>
          <DialogTitle>
            {step === "select" ? "Select Item to Delete" : "Confirm Deletion"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "select" ? (
            <div className="space-y-2">
              <Label>Select Content Item</Label>
              <ComboBox
                options={itemOptions}
                value={selectedItemId}
                onValueChange={setSelectedItemId}
                placeholder="Choose item to delete"
                searchPlaceholder="Search items..."
                testId="select-delete-item"
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  You are about to delete: <strong>{selectedItem?.title}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Please enter your credentials to confirm.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  data-testid="input-delete-username"
                />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-delete-password"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {step === "select" ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleNext} data-testid="button-delete-next">
                Next
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep("select")}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                data-testid="button-delete-confirm"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
