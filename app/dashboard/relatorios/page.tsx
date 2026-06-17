'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Printer, FileSpreadsheet } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

type Report = {
  id: string;
  name: string;
  type: string;
  lastGenerated: string;
  rows: Record<string, string | number>[];
};

// Converte dados tabulares para CSV compatível com Excel/Sheets.
// Mantém aspas escapadas para nomes, endereços e descrições com vírgula.
const toCsv = (rows: Record<string, string | number>[]) => {
  if (rows.length === 0) return '';

  const headers = Object.keys(rows[0]);
  const escapeCell = (value: string | number) => {
    const text = String(value);
    return `"${text.replaceAll('"', '""')}"`;
  };

  return [
    headers.map(escapeCell).join(','),
    ...rows.map(row => headers.map(header => escapeCell(row[header] ?? '')).join(',')),
  ].join('\n');
};

// Cria um arquivo CSV em memória e dispara o download no navegador.
const downloadCsv = (filename: string, rows: Record<string, string | number>[]) => {
  const csv = toCsv(rows);
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// Como a impressão monta HTML manualmente, escapamos qualquer texto vindo
// dos cadastros para evitar injeção de HTML/script dentro do relatório.
const escapeHtml = (value: string | number) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

export default function RelatoriosPage() {
  const { clients, products, sales, transactions } = useApp();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const reports: Report[] = useMemo(() => {
    const productRanking = products
      .map(product => {
        const soldQuantity = sales.reduce((total, sale) => {
          const item = sale.products.find(saleProduct => saleProduct.productId === product.id);
          return total + (item?.quantity ?? 0);
        }, 0);

        return {
          SKU: product.sku,
          Produto: product.name,
          Categoria: product.category,
          Vendidos: soldQuantity,
          Estoque: product.stock,
          'Preço de venda': formatCurrency(product.salePrice),
        };
      })
      .sort((a, b) => Number(b.Vendidos) - Number(a.Vendidos));

    return [
      {
        id: 'financeiro',
        name: 'Fechamento Financeiro',
        type: 'Financeiro',
        lastGenerated: 'Agora',
        rows: transactions.map(transaction => ({
          Data: transaction.date,
          Tipo: transaction.type === 'income' ? 'Receita' : 'Despesa',
          Categoria: transaction.category,
          Descrição: transaction.description,
          Valor: formatCurrency(transaction.amount),
        })),
      },
      {
        id: 'estoque',
        name: 'Posição de Estoque',
        type: 'Estoque',
        lastGenerated: 'Agora',
        rows: products.map(product => ({
          SKU: product.sku,
          Produto: product.name,
          Categoria: product.category,
          Fornecedor: product.supplier,
          Estoque: product.stock,
          'Preço de custo': formatCurrency(product.purchasePrice),
          'Preço de venda': formatCurrency(product.salePrice),
        })),
      },
      {
        id: 'vendas',
        name: 'Ranking de Vendas por Produto',
        type: 'Vendas',
        lastGenerated: 'Agora',
        rows: productRanking,
      },
      {
        id: 'clientes',
        name: 'Carteira de Clientes Ativos',
        type: 'Clientes',
        lastGenerated: 'Agora',
        rows: clients.map(client => ({
          Nome: client.name,
          Documento: client.document,
          Telefone: client.phone,
          Email: client.email,
          Endereço: client.address,
          Cadastro: client.createdAt,
        })),
      },
    ];
  }, [clients, products, sales, transactions]);

  const printReport = (report: Report) => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    const headers = report.rows[0] ? Object.keys(report.rows[0]) : [];
    const tableRows = report.rows
      .map(row => `<tr>${headers.map(header => `<td>${escapeHtml(row[header] ?? '')}</td>`).join('')}</tr>`)
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${report.name}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 24px; }
            h1 { font-size: 22px; margin-bottom: 4px; }
            p { color: #6b7280; margin-top: 0; }
            table { border-collapse: collapse; width: 100%; margin-top: 24px; font-size: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background: #f9fafb; }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(report.name)}</h1>
          <p>Módulo: ${escapeHtml(report.type)} | Gerado: ${new Date().toLocaleString('pt-BR')}</p>
          <table>
            <thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
            <tbody>${tableRows || `<tr><td colspan="${headers.length || 1}">Nenhum dado disponível.</td></tr>`}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">Exportação de dados e relatórios gerenciais</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{report.name}</CardTitle>
                  <CardDescription>Módulo: {report.type}</CardDescription>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-muted-foreground">
                  {report.rows.length} registros | Gerado: {report.lastGenerated}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="px-2" title="Imprimir" onClick={() => printReport(report)}>
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-2"
                    title="Exportar CSV"
                    onClick={() => downloadCsv(`leal-erp-${report.id}.csv`, report.rows)}
                    disabled={report.rows.length === 0}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                  </Button>
                  <Button variant="default" size="sm" className="px-2" title="Salvar como PDF" onClick={() => printReport(report)}>
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
