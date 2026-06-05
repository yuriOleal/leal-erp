'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Printer, FileSpreadsheet } from 'lucide-react';

export default function RelatoriosPage() {
  const relatorios = [
    { id: 1, name: 'Fechamento Financeiro Mensal', type: 'Financeiro', lastGenerated: 'Há 2 dias' },
    { id: 2, name: 'Posição de Estoque (Completo)', type: 'Estoque', lastGenerated: 'Hoje' },
    { id: 3, name: 'Ranking de Vendas por Produto', type: 'Vendas', lastGenerated: 'Há 5 dias' },
    { id: 4, name: 'Carteira de Clientes Ativos', type: 'Clientes', lastGenerated: 'Há 1 semana' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">Exportação de dados e relatórios gerenciais</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {relatorios.map((rel) => (
          <Card key={rel.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{rel.name}</CardTitle>
                  <CardDescription>Módulo: {rel.type}</CardDescription>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-muted-foreground">Gerado: {rel.lastGenerated}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="px-2" title="Imprimir">
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="px-2" title="Exportar CSV">
                    <FileSpreadsheet className="h-4 w-4" />
                  </Button>
                  <Button variant="default" size="sm" className="px-2" title="Exportar PDF">
                    <Download className="h-4 w-4 mr-1" /> PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
