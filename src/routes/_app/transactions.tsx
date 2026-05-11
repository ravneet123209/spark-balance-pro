import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useDeleteTransaction, useTransactions, type Transaction } from "@/hooks/use-transactions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Search, Trash2, Loader2, Inbox, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { CATEGORIES, formatCurrency } from "@/lib/categories";
import { TransactionDialog } from "@/components/transaction-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/transactions")({ component: TransactionsPage });

type SortKey = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

function TransactionsPage() {
  const { data: tx, isLoading } = useTransactions();
  const del = useDeleteTransaction();

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("date_desc");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [toDelete, setToDelete] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    let list = tx ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => (t.description ?? "").toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
      );
    }
    if (cat !== "all") list = list.filter((t) => t.category === cat);
    if (type !== "all") list = list.filter((t) => t.type === type);
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "date_asc": return a.date.localeCompare(b.date);
        case "date_desc": return b.date.localeCompare(a.date);
        case "amount_asc": return Number(a.amount) - Number(b.amount);
        case "amount_desc": return Number(b.amount) - Number(a.amount);
      }
    });
    return list;
  }, [tx, search, cat, type, sort]);

  const handleEdit = (t: Transaction) => { setEditing(t); setDialogOpen(true); };
  const handleAdd = () => { setEditing(null); setDialogOpen(true); };
  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await del.mutateAsync(toDelete.id);
      toast.success("Transaction deleted");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description or category..."
              className="pl-9"
            />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Newest first</SelectItem>
              <SelectItem value="date_asc">Oldest first</SelectItem>
              <SelectItem value="amount_desc">Highest amount</SelectItem>
              <SelectItem value="amount_asc">Lowest amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAdd} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Add transaction
        </Button>
      </div>

      <Card className="shadow-[var(--shadow-card)]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="grid h-64 place-items-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="grid place-items-center gap-3 px-6 py-16 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground">
                <Inbox className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">No transactions found</p>
                <p className="text-sm text-muted-foreground">
                  {tx && tx.length > 0 ? "Try adjusting your filters." : "Add your first transaction to get started."}
                </p>
              </div>
              {(!tx || tx.length === 0) && (
                <Button onClick={handleAdd} className="mt-2">
                  <Plus className="mr-2 h-4 w-4" /> Add transaction
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 max-w-[280px] truncate">{t.description || <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-4 py-3"><Badge variant="secondary">{t.category}</Badge></td>
                      <td className="px-4 py-3">
                        {t.type === "income" ? (
                          <span className="inline-flex items-center gap-1 text-success">
                            <ArrowUpRight className="h-3.5 w-3.5" /> Income
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-destructive">
                            <ArrowDownRight className="h-3.5 w-3.5" /> Expense
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium tabular-nums ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                        {t.type === "income" ? "+" : "-"}{formatCurrency(Number(t.amount))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(t)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setToDelete(t)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete transaction?"
        description="This will permanently remove the transaction from your records."
      />
    </div>
  );
}
