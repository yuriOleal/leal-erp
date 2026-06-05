'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApp } from '@/lib/context/AppContext';
import { Search, Plus, MoreHorizontal, FileText, CheckCircle, Clock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SaleModal } from '@/components/modals/sale-modal';

export default function VendasPage() {
  const { sales } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredSales = sales.filter(s => 
    s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.includes(searchTerm)
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vendas</h2>
          <p className="text-muted-foreground">Histórico e criação de novas vendas</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
          <Plus className="mr-2 h-4 w-4" />
          Nova Venda
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por cliente ou ID..."
              className="pl-8 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Venda ID</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-mono font-medium">#{sale.id}</TableCell>
                  <TableCell>{new Date(sale.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="font-medium">{sale.clientName}</TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${sale.status === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {sale.status === 'completed' ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      {sale.status === 'completed' ? 'Concluída' : 'Pendente'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(sale.total)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          const items = sale.products.map(p => `${p.quantity}x ${p.name} (R$ ${p.price.toFixed(2)})`).join('\n');
                          alert(`Produtos nesta venda:\n${items}`);
                        }}>
                          <FileText className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    Nenhuma venda encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SaleModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
}
