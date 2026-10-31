'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  ChevronDown,
  CircleDollarSign,
  FileDown,
  Menu,
  ShieldCheck,
  ShoppingCart,
  X,
} from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';

const benefits = [
  {
    icon: ShoppingCart,
    title: 'Venda sem perder o controle',
    description: 'Registre pedidos, confira itens e atualize o estoque no mesmo fluxo.',
    accent: 'bg-[#e9f3ef] text-[#123c32]',
  },
  {
    icon: Boxes,
    title: 'Estoque que acompanha a operação',
    description: 'Visualize saldo, custo, reposição e produtos críticos sem depender de planilhas.',
    accent: 'bg-[#fff2dc] text-[#8a5516]',
  },
  {
    icon: CircleDollarSign,
    title: 'Financeiro ligado ao que acontece',
    description: 'Receitas e despesas aparecem de forma clara, com histórico rastreável.',
    accent: 'bg-[#f0eee9] text-[#3f4542]',
  },
];

const faqs = [
  {
    question: 'O Leal ERP já pode ser usado por uma empresa real?',
    answer:
      'Sim. O sistema já cobre clientes, produtos, vendas, estoque, financeiro e relatórios. Novos recursos serão adicionados de forma gradual, sem prometer funcionalidades que ainda não existem.',
  },
  {
    question: 'Para qual tipo de negócio ele é mais indicado?',
    answer:
      'A experiência atual foi pensada principalmente para comércios e pequenas distribuidoras que precisam conectar vendas, estoque e caixa em uma operação simples.',
  },
  {
    question: 'Os dados ficam separados por conta?',
    answer:
      'Sim. A aplicação utiliza autenticação e políticas de acesso no Supabase para manter os dados de cada usuário isolados.',
  },
  {
    question: 'Consigo exportar minhas informações?',
    answer:
      'Sim. Os relatórios podem ser exportados em CSV e preparados para impressão ou PDF diretamente pelo navegador.',
  },
];

const productModules = [
  { icon: ShoppingCart, label: 'Vendas', text: 'Pedidos e detalhes dos itens' },
  { icon: Boxes, label: 'Estoque', text: 'Entradas, saídas e reposição' },
  { icon: BarChart3, label: 'Indicadores', text: 'Visão financeira e operacional' },
  { icon: FileDown, label: 'Relatórios', text: 'CSV, impressão e PDF' },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f1e8] text-[#18332c] selection:bg-[#d8a755] selection:text-[#18332c]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#102d27]/90 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="Leal ERP — início">
            <BrandLogo inverted />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-white/65 lg:flex">
            <a className="transition-colors hover:text-white" href="#produto">Produto</a>
            <a className="transition-colors hover:text-white" href="#como-funciona">Como funciona</a>
            <a className="transition-colors hover:text-white" href="#seguranca">Segurança</a>
            <a className="transition-colors hover:text-white" href="#faq">Dúvidas</a>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/login">
              <Button variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
                Entrar
              </Button>
            </Link>
            <Link href="/login">
              <Button className="rounded-full bg-[#e8a84c] px-6 font-semibold text-[#17352d] hover:bg-[#f2ba68]">
                Criar conta
              </Button>
            </Link>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            className="rounded-full p-2 text-white lg:hidden"
            onClick={() => setMenuOpen(value => !value)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/10 bg-[#102d27] px-5 py-6 lg:hidden"
            >
              <div className="flex flex-col gap-5">
                {[
                  ['Produto', '#produto'],
                  ['Como funciona', '#como-funciona'],
                  ['Segurança', '#seguranca'],
                  ['Dúvidas', '#faq'],
                ].map(([label, href]) => (
                  <a key={href} href={href} onClick={() => setMenuOpen(false)} className="text-white/75">
                    {label}
                  </a>
                ))}
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full bg-[#e8a84c] text-[#17352d]">Acessar o Leal ERP</Button>
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <section className="relative min-h-[850px] bg-[#102d27] pt-20 text-white lg:min-h-[900px]">
        <Image
          src="/images/leal-operations-hero.png"
          alt="Estoque organizado com bancada de operação, notebook e leitor de código de barras"
          fill
          priority
          className="object-cover object-[62%_center] opacity-80"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#102d27_0%,rgba(16,45,39,.97)_35%,rgba(16,45,39,.35)_72%,rgba(16,45,39,.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,#102d27_100%)]" />

        <div className="relative mx-auto flex min-h-[780px] max-w-7xl items-center px-5 py-24 sm:px-8 lg:min-h-[820px]">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0c985]"
            >
              <span className="h-px w-10 bg-[#e8a84c]" aria-hidden="true" />
              Feito para operações que precisam fluir
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="max-w-xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[76px]"
            >
              Sua empresa em ordem. Suas decisões mais claras.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-7 max-w-xl text-lg leading-8 text-white/68"
            >
              Vendas, estoque, clientes e financeiro conectados em um sistema direto ao ponto,
              pensado para pequenos comércios e distribuidoras.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <Link href="/login">
                <Button size="lg" className="h-13 rounded-full bg-[#e8a84c] px-7 font-semibold text-[#17352d] hover:bg-[#f2ba68]">
                  Conhecer o sistema
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#produto">
                <Button size="lg" variant="outline" className="h-13 rounded-full border-white/25 bg-white/5 px-7 text-white hover:bg-white/10 hover:text-white">
                  Ver o que ele resolve
                </Button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/55"
            >
              {['Sem cartão para começar', 'Dados isolados por conta', 'Exportação disponível'].map(item => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#e8a84c]" />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section id="produto" className="relative z-10 -mt-20 px-5 sm:px-8">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-[#d9d4ca] bg-[#fbfaf6] p-6 shadow-[0_24px_70px_rgba(18,60,50,.13)] sm:p-9">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {productModules.map(module => (
              <div key={module.label} className="rounded-2xl border border-[#e6e0d6] bg-white p-5">
                <module.icon className="mb-8 h-5 w-5 text-[#1c5b4d]" />
                <p className="font-semibold">{module.label}</p>
                <p className="mt-1 text-sm leading-6 text-[#68736f]">{module.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <div className="grid items-start gap-16 lg:grid-cols-[.85fr_1.15fr]">
          <div className="lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a66c22]">Menos improviso</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              O básico bem conectado muda a rotina inteira.
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[#68736f]">
              O Leal ERP não tenta esconder complexidade com enfeites. Ele organiza os pontos que mais
              consomem tempo em uma operação pequena.
            </p>
          </div>

          <div className="grid gap-5">
            {benefits.map((benefit, index) => (
              <motion.article
                key={benefit.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: index * 0.08 }}
                className="grid gap-5 rounded-[28px] border border-[#ded8cd] bg-[#fbfaf6] p-7 sm:grid-cols-[64px_1fr] sm:p-9"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${benefit.accent}`}>
                  <benefit.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold tracking-[-0.03em]">{benefit.title}</h3>
                  <p className="mt-3 max-w-xl leading-7 text-[#68736f]">{benefit.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bg-[#e8e3d9] px-5 py-28 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a66c22]">Um fluxo coerente</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              A venda acontece uma vez. O sistema organiza o restante.
            </h2>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-[28px] border border-[#cec8bd] bg-[#cec8bd] lg:grid-cols-3">
            {[
              ['01', 'Cadastre sua base', 'Clientes e produtos entram com informações claras e validações úteis.'],
              ['02', 'Registre a operação', 'Cada venda guarda itens, valores, cliente e data para consulta posterior.'],
              ['03', 'Acompanhe o resultado', 'Estoque, caixa e relatórios refletem os dados registrados no sistema.'],
            ].map(([number, title, text]) => (
              <div key={number} className="bg-[#f5f1e8] p-8 sm:p-10">
                <span className="text-sm font-semibold text-[#a66c22]">{number}</span>
                <h3 className="mt-16 text-2xl font-semibold tracking-[-0.03em]">{title}</h3>
                <p className="mt-3 leading-7 text-[#68736f]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="seguranca" className="bg-[#102d27] px-5 py-28 text-white sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheck className="h-7 w-7 text-[#f0c985]" />
            </div>
            <h2 className="mt-7 max-w-xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              Confiança vem de dizer exatamente o que existe.
            </h2>
          </div>
          <div className="grid gap-4 text-white/68">
            {[
              'Autenticação gerenciada pelo Supabase.',
              'Políticas de acesso para separar os dados de cada conta.',
              'Validação de formulários antes de gravar informações.',
              'Exportação dos dados operacionais em formatos acessíveis.',
            ].map(item => (
              <div key={item} className="flex items-start gap-3 border-b border-white/10 pb-4">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#e8a84c]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-5xl px-5 py-28 sm:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a66c22]">Perguntas honestas</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Antes de começar</h2>
        </div>

        <div className="mt-14 border-t border-[#d7d1c6]">
          {faqs.map((faq, index) => (
            <div key={faq.question} className="border-b border-[#d7d1c6]">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-5 py-6 text-left text-lg font-semibold"
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
              >
                {faq.question}
                <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${activeFaq === index ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeFaq === index && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="max-w-3xl overflow-hidden pb-6 leading-7 text-[#68736f]"
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[32px] bg-[#dca14d] p-8 text-[#17352d] sm:p-12 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em]">Leal ERP</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Organize a operação antes que ela comece a cobrar esse preço.
            </h2>
          </div>
          <Link href="/login">
            <Button size="lg" className="h-13 rounded-full bg-[#17352d] px-7 text-white hover:bg-[#214d42]">
              Criar minha conta
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-[#0c231e] px-5 py-14 text-white sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <BrandLogo inverted />
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/50">
              Gestão empresarial direta para comércios e pequenas distribuidoras.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Produto</p>
            <div className="mt-4 grid gap-3 text-sm text-white/50">
              <a href="#produto">Recursos</a>
              <a href="#seguranca">Segurança</a>
              <Link href="/login">Acessar</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Informações</p>
            <div className="mt-4 grid gap-3 text-sm text-white/50">
              <Link href="/privacidade">Privacidade</Link>
              <Link href="/termos">Termos de uso</Link>
              <a href="mailto:contato@lealerp.com.br">Contato</a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/35 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Leal ERP.</span>
          <span>Construído para simplificar operações reais.</span>
        </div>
      </footer>
    </main>
  );
}
