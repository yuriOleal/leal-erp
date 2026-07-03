'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApp } from '@/lib/context/AppContext';
import { Client } from '@/types';
import { Search, Plus, MoreHorizontal, Pencil, Trash2, Users, UserRoundPlus, Mail, CalendarDays } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ClientModal } from '@/components/modals/client-modal';
import { PageHeader } from '@/components/page-header';
import { MetricCard } from '@/components/metric-card';
import { EmptyState } from '@/components/empty-state';
import { formatDate } from '@/lib/formatters';

export default function ClientesPage() {
  const { clients, deleteClient } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const filteredClients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return clients;

    return clients.filter(client =>
      client.name.toLowerCase().includes(query) ||
      client.document.includes(query) ||
      client.phone.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query)
    );
  }, [clients, searchTerm]);

  const clientsWithEmail = clients.filter(client => client.email.trim().length > 0).length;
  const newestClient = [...clients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const handleNewClient = () => {
    setClientToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClient(id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Relacionamento"
        title="Clientes"
        description="Centralize sua carteira com documentos válidos, contato e histórico para vender com mais controle."
        actions={
          <Button onClick={handleNewClient}>
            <Plus className="h-4 w-4" />
            Novo cliente
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Clientes"
          value={clients.length}
          description="Cadastros ativos na conta."
          icon={Users}
          tone="green"
        />
        <MetricCard
          label="Com email"
          value={clientsWithEmail}
          description="Contatos prontos para comunicação."
          icon={Mail}
          tone="slate"
        />
        <MetricCard
          label="Mais recente"
          value={newestClient ? formatDate(newestClient.createdAt) : '—'}
          description={newestClient ? newestClient.name : 'Nenhum cadastro ainda.'}
          icon={CalendarDays}
          tone="amber"
        />
      </div>

      <Card className="border-white/70 bg-white/80 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/55 dark:shadow-none">
        <CardHeader className="border-b pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome, CPF/CNPJ, telefone ou email..."
                className="h-10 rounded-xl bg-background pl-9"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {filteredClients.length} de {clients.length} cliente(s)
            </p>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="font-semibold">{client.name}</div>
                    <div className="text-xs text-muted-foreground lg:hidden">{client.email}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{client.document}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell className="hidden md:table-cell">{client.email}</TableCell>
                  <TableCell className="hidden lg:table-cell">{formatDate(client.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-accent hover:text-accent-foreground">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClient(client)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClient(client.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      icon={UserRoundPlus}
                      title={clients.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado'}
                      description={
                        clients.length === 0
                          ? 'Cadastre o primeiro cliente para começar a montar histórico de vendas e atendimento.'
                          : 'Tente outro termo de busca para localizar o cadastro desejado.'
                      }
                      action={
                        clients.length === 0 ? (
                          <Button size="sm" onClick={handleNewClient}>
                            Cadastrar cliente
                          </Button>
                        ) : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ClientModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        clientToEdit={clientToEdit}
      />
    </div>
  );
}
