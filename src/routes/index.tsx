import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Calendar,
  AlignLeft,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Minhas Tarefas — Organize seu dia" },
      {
        name: "description",
        content:
          "Lista de tarefas com título, prazo, prioridade, conteúdo e categorias: Trabalho, Atendimentos, Estudos, Financeiro e mais.",
      },
      { property: "og:title", content: "Minhas Tarefas — Organize seu dia" },
      {
        property: "og:description",
        content:
          "Lista de tarefas com título, prazo, prioridade, conteúdo e categorias: Trabalho, Atendimentos, Estudos, Financeiro e mais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const CATEGORIES = [
  "Trabalho",
  "Atendimentos",
  "Estudos",
  "Financeiro",
  "Conteúdo/Redes sociais",
  "Cursos/Formações",
  "Administrativo",
  "Pessoal",
] as const;

const PRIORITIES = ["Alta", "Média", "Baixa"] as const;

type Priority = (typeof PRIORITIES)[number];

interface Task {
  id: string;
  title: string;
  deadline: string;
  priority: Priority;
  content: string;
  categories: string[];
  done: boolean;
  createdAt: number;
}

const priorityStyles: Record<Priority, string> = {
  Alta: "bg-destructive/10 text-destructive",
  Média: "bg-[oklch(0.828_0.189_84.429/15%)] text-[oklch(0.55_0.15_75)]",
  Baixa: "bg-accent text-accent-foreground",
};

const emptyForm = {
  title: "",
  deadline: "",
  priority: "Média" as Priority,
  content: "",
  categories: [] as string[],
};

function Index() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem("tasks");
      return raw ? (JSON.parse(raw) as Task[]) : [];
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("Todas");
  const [showDone, setShowDone] = useState(true);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const toggleCategory = (cat: string) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [cat],
    }));
  };

  const saveTask = () => {
    if (!form.title.trim()) return;
    if (editingId) {
      setTasks((ts) =>
        ts.map((t) => (t.id === editingId ? { ...t, ...form, title: form.title.trim() } : t)),
      );
    } else {
      setTasks((ts) => [
        {
          id: crypto.randomUUID(),
          ...form,
          title: form.title.trim(),
          done: false,
          createdAt: Date.now(),
        },
        ...ts,
      ]);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (task: Task) => {
    setForm({
      title: task.title,
      deadline: task.deadline,
      priority: task.priority,
      content: task.content,
      categories: task.categories,
    });
    setEditingId(task.id);
    setShowForm(true);
  };

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => showDone || !t.done)
      .filter((t) => filterCategory === "Todas" || t.categories.includes(filterCategory))
      .sort((a, b) => {
        const pa = PRIORITIES.indexOf(a.priority);
        const pb = PRIORITIES.indexOf(b.priority);
        if (pa !== pb) return pa - pb;
        return (a.deadline || "9999").localeCompare(b.deadline || "9999");
      });
  }, [tasks, filterCategory, showDone]);

  const pendingCount = tasks.filter((t) => !t.done).length;

  const formatDate = (d: string) => {
    if (!d) return null;
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  const isOverdue = (t: Task) =>
    !t.done && t.deadline && t.deadline < new Date().toISOString().slice(0, 10);

  const getDeadlineStatus = (t: Task) => {
    if (t.done || !t.deadline) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(`${t.deadline}T00:00:00`);
    const diffInDays =
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays < 0) return "overdue";
    if (diffInDays === 0) return "today";
    if (diffInDays < 2) return "soon";

    return "normal";
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Minhas Tarefas
          </h1>
          <p className="mt-1 text-muted-foreground">
            {pendingCount} {pendingCount === 1 ? "tarefa pendente" : "tarefas pendentes"}
          </p>
        </header>

        {/* New task button / form */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Nova tarefa
          </button>
        ) : (
          <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">
              {editingId ? "Editar tarefa" : "Nova tarefa"}
            </h2>
            <div className="space-y-4">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Título da tarefa"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Prazo
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Prioridade
                  </label>
                  <div className="flex gap-2">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        onClick={() => setForm({ ...form, priority: p })}
                        className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                          form.priority === p
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background text-foreground hover:bg-muted"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Conteúdo
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Detalhes, anotações, links..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Categorias
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        form.categories.includes(cat)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={saveTask}
                  disabled={!form.title.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" /> {editingId ? "Salvar" : "Adicionar"}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <X className="h-4 w-4" /> Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterCategory("Todas")}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              filterCategory === "Todas"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-card text-foreground hover:bg-muted"
            }`}
          >
            Todas
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                filterCategory === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-card text-foreground hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={showDone}
              onChange={(e) => setShowDone(e.target.checked)}
              className="accent-[oklch(0.459_0.097_182)]"
            />
            Mostrar concluídas
          </label>
        </div>

        {/* Task list */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            Nenhuma tarefa por aqui. Crie a primeira!
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((task) => (
              <li
                key={task.id}
                className={`group rounded-xl border border-border bg-card p-4 shadow-sm transition-opacity ${
                  task.done ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() =>
                      setTasks((ts) =>
                        ts.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)),
                      )
                    }
                    aria-label={task.done ? "Reabrir tarefa" : "Concluir tarefa"}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                      task.done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input hover:border-primary"
                    }`}
                  >
                    {task.done && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`font-semibold text-card-foreground ${
                          task.done ? "line-through" : ""
                        }`}
                      >
                        {task.title}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${priorityStyles[task.priority]}`}
                      >
                        {task.priority}
                      </span>

                      
                        
                    <div className="flex flex-wrap items-center gap-2">
                      {task.deadline && (
                        <span
                          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            getDeadlineStatus(task) === "overdue"
                              ? "bg-destructive/10 text-destructive"
                              : getDeadlineStatus(task) === "today"
                              ? "bg-orange-500/10 text-orange-600"
                              : getDeadlineStatus(task) === "soon"
                              ? "bg-yellow-500/10 text-yellow-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Calendar className="h-3 w-3" />

                          {formatDate(task.deadline)}

                          {getDeadlineStatus(task) === "overdue" && " — atrasada"}
                          {getDeadlineStatus(task) === "today" && " — hoje"}
                          {getDeadlineStatus(task) === "soon" && " — próxima"}
                        </span>
                      )}
                    </div>


                    </div>
                    {task.content && (
                      <p className="mt-1 flex items-start gap-1.5 whitespace-pre-wrap text-sm text-muted-foreground">
                        <AlignLeft className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {task.content}
                      </p>
                    )}

                    {task.categories.map((cat) => (
                        <span
                          key={cat}
                          className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground"
                        >
                          {cat}
                        </span>
                      ))}

                  </div>
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => startEdit(task)}
                      aria-label="Editar"
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setTasks((ts) => ts.filter((t) => t.id !== task.id))}
                      aria-label="Excluir"
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
