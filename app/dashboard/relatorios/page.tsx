'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Printer, FileSpreadsheet, BarChart3, Boxes, Users, WalletCards } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { formatCurrency } from '@/lib/formatters';

type Report = {
  id: 'financeiro' | 'estoque' | 'vendas' | 'clientes';
  name: string;
  type: string;
  description: string;
  rows: Record<string, string | number>[];
};

const reportIcons = {
  financeiro: WalletCards,
  estoque: Boxes,
  vendas: BarChart3,
  clientes: Users,
};

// Converte dados tabulares para CSV compatível com Excel/Sheets.
// Mantém aspas escapadas para nomes, endereços e descrições com vírgula.
const toCsv = (rows: Record<string, string | number>[]) => {
  if (rows.length === 0) return '';

  const headers = Object.keys(rows[0]);
  const escapeCell = (value: string | number) => {
    const rawText = String(value);
    // Evita que Excel e Sheets interpretem dados cadastrados como fórmulas.
    const text = /^[=+\-@]/.test(rawText) ? `'${rawText}` : rawText;
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

  const reports: Report[] = useMemo(() => {
    const soldQuantityByProduct = new Map<string, number>();

    // Só pedidos concluídos entram em venda realizada. A soma por mapa também
    // mantém o cálculo correto se um produto aparecer mais de uma vez em dados antigos.
    sales
      .filter(sale => sale.status === 'completed')
      .flatMap(sale => sale.products)
      .forEach(item => {
        soldQuantityByProduct.set(
          item.productId,
          (soldQuantityByProduct.get(item.productId) ?? 0) + item.quantity
        );
      });

    const productRanking = products
      .map(product => {
        const soldQuantity = soldQuantityByProduct.get(product.id) ?? 0;

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
        description: 'Receitas, despesas, categorias e valores lançados.',
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
        description: 'SKU, fornecedor, custo, preço e quantidade atual.',
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
        description: 'Produtos ordenados por quantidade vendida.',
        rows: productRanking,
      },
      {
        id: 'clientes',
        name: 'Carteira de Clientes Ativos',
        type: 'Clientes',
        description: 'Contatos, documentos e dados cadastrais.',
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
          <title>${escapeHtml(report.name)}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #102d27; padding: 28px; }
            .brand { color: #64746f; font-size: 12px; letter-spacing: .14em; text-transform: uppercase; }
            h1 { font-size: 24px; margin: 6px 0 4px; }
            p { color: #5f6f6a; margin-top: 0; }
            table { border-collapse: collapse; width: 100%; margin-top: 24px; font-size: 12px; }
            th, td { border: 1px solid #dfe7e3; padding: 9px; text-align: left; }
            th { background: #f5f1e8; color: #102d27; }
          </style>
        </head>
        <body>
          <div class="brand">Leal ERP</div>
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
      <PageHeader
        eyebrow="Inteligência"
        title="Relatórios"
        description="Exporte dados reais do ERP para CSV, impressão ou PDF sem depender de métricas fictícias."
      />

      <div className="grid gap-5 md:grid-cols-2">
        {reports.map((report) => {
          const Icon = reportIcons[report.id];

          return (
            <Card
              key={report.id}
              className="group border-white/70 bg-white/80 shadow-sm shadow-slate-200/60 transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md dark:border-white/10 dark:bg-slate-900/55 dark:shadow-none"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span className="rounded-full bg-muted px-2.5 py-1">Módulo: {report.type}</span>
                  <span className="rounded-full bg-muted px-2.5 py-1">{report.rows.length} registro(s)</span>
                  <span className="rounded-full bg-muted px-2.5 py-1">Gerado agora</span>
                </div>

                {report.rows.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="Relatório sem dados"
                    description="Quando este módulo tiver registros, as opções de exportação ficarão mais úteis."
                    className="rounded-2xl border bg-muted/30 py-6"
                  />
                ) : null}

                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" size="sm" title="Imprimir" onClick={() => printReport(report)}>
                    <Printer className="h-4 w-4" />
                    Imprimir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    title="Exportar CSV"
                    onClick={() => downloadCsv(`leal-erp-${report.id}.csv`, report.rows)}
                    disabled={report.rows.length === 0}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV
                  </Button>
                  <Button size="sm" title="Salvar como PDF" onClick={() => printReport(report)}>
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
