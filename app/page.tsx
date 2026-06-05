'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Check, 
  ChevronDown, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Shield, 
  Zap, 
  BarChart3, 
  Layers, 
  Package, 
  FileText,
  Star,
  Activity,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-[1000px] right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-600/20">
              L
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Leal ERP
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#beneficios" className="hover:text-white transition-colors">Benefícios</a>
            <a href="#como-funciona" className="hover:text-white transition-colors">Funcionamento</a>
            <a href="#diferenciais" className="hover:text-white transition-colors">Diferenciais</a>
            <a href="#precos" className="hover:text-white transition-colors">Preços</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Acessar Conta
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/25 transition-all">
                Iniciar Demo Grátis
              </Button>
            </Link>
          </div>

          <button 
            className="md:hidden text-slate-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-18 left-0 w-full bg-slate-900 border-b border-slate-800 z-40 px-6 py-8 space-y-6 flex flex-col"
          >
            <a href="#beneficios" onClick={() => setIsMenuOpen(false)} className="text-lg text-slate-300 hover:text-white">Benefícios</a>
            <a href="#como-funciona" onClick={() => setIsMenuOpen(false)} className="text-lg text-slate-300 hover:text-white">Funcionamento</a>
            <a href="#diferenciais" onClick={() => setIsMenuOpen(false)} className="text-lg text-slate-300 hover:text-white">Diferenciais</a>
            <a href="#precos" onClick={() => setIsMenuOpen(false)} className="text-lg text-slate-300 hover:text-white">Preços</a>
            <a href="#faq" onClick={() => setIsMenuOpen(false)} className="text-lg text-slate-300 hover:text-white">FAQ</a>
            <div className="h-px bg-slate-800 w-full" />
            <div className="flex flex-col gap-4">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                  Acessar Conta
                </Button>
              </Link>
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-indigo-600 text-white">
                  Iniciar Demo Grátis
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold"
          >
            <Zap className="h-3.5 w-3.5" />
            SaaS ERP de Nova Geração
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl leading-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent"
          >
            Controle total do seu negócio em uma única tela de alta performance
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-lg sm:text-xl max-w-2xl font-normal leading-relaxed"
          >
            Automatize seu financeiro, controle o estoque físico em tempo real, registre suas vendas de forma inteligente e tome decisões estratégicas com relatórios instantâneos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/login">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-6 rounded-xl shadow-xl shadow-indigo-600/20 text-md gap-2 transition-all group">
                Acessar ERP (Demo Grátis)
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#beneficios">
              <Button size="lg" variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold px-8 py-6 rounded-xl text-md">
                Conhecer Recursos
              </Button>
            </a>
          </motion.div>

          {/* Premium Mock Dashboard Preview (Interactive Style) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, type: 'spring' }}
            className="w-full max-w-5xl mt-12 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative"
          >
            {/* Header window control */}
            <div className="bg-slate-900/60 px-4 py-3 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-xs text-slate-500 font-mono">dashboard.lealerp.com.br</span>
              <span className="w-10" />
            </div>

            {/* Dashboard Mock Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-950 text-left">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col gap-2 border-r border-slate-900 pr-4">
                <span className="h-7 w-28 bg-slate-800/80 rounded" />
                <div className="h-px bg-slate-900 my-2" />
                <span className="h-8 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-lg px-2 flex items-center text-xs font-semibold">Dashboard</span>
                <span className="h-8 bg-slate-900 rounded-lg px-2 flex items-center text-xs text-slate-400">Clientes</span>
                <span className="h-8 bg-slate-900 rounded-lg px-2 flex items-center text-xs text-slate-400">Produtos</span>
                <span className="h-8 bg-slate-900 rounded-lg px-2 flex items-center text-xs text-slate-400">Estoque</span>
                <span className="h-8 bg-slate-900 rounded-lg px-2 flex items-center text-xs text-slate-400">Vendas</span>
              </div>

              {/* Main Content Pane */}
              <div className="md:col-span-3 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-5 w-24 bg-slate-800 rounded" />
                    <div className="h-3 w-36 bg-slate-900 rounded mt-2" />
                  </div>
                  <span className="h-8 w-20 bg-indigo-600 rounded-lg" />
                </div>

                {/* Cards row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
                    <span className="h-3 w-16 bg-slate-800 rounded block" />
                    <span className="h-6 w-24 bg-slate-700 rounded block mt-2" />
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
                    <span className="h-3 w-16 bg-slate-800 rounded block" />
                    <span className="h-6 w-24 bg-emerald-500/20 rounded block mt-2 text-emerald-400 text-sm font-semibold flex items-center justify-center">R$ 45.000</span>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
                    <span className="h-3 w-16 bg-slate-800 rounded block" />
                    <span className="h-6 w-12 bg-slate-700 rounded block mt-2" />
                  </div>
                </div>

                {/* Simulated Chart */}
                <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-4 h-48 flex items-end gap-3.5">
                  <div className="w-full bg-slate-800/50 rounded-t h-[30%]" />
                  <div className="w-full bg-slate-800/50 rounded-t h-[45%]" />
                  <div className="w-full bg-slate-800/50 rounded-t h-[60%]" />
                  <div className="w-full bg-slate-800/50 rounded-t h-[50%]" />
                  <div className="w-full bg-indigo-600/80 rounded-t h-[85%]" />
                  <div className="w-full bg-slate-800/50 rounded-t h-[70%]" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust & Indicators Section */}
      <section className="bg-slate-950 border-y border-slate-800 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white">+10.000</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresas Geridas</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white">R$ 2B+</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transacionados</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white">99.99%</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Uptime Garantido</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white">4.9 / 5</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avaliação Média</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Recursos e Benefícios</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Desenvolvido para acelerar sua gestão</h3>
          <p className="text-slate-400 leading-relaxed">
            Elimine planilhas manuais bagunçadas. O Leal ERP unifica todas as pontas da sua operação em fluxos eficientes e integrados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Finance */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="bg-slate-950 border border-slate-800 p-8 rounded-2xl space-y-4 hover:border-indigo-500/50 transition-all"
          >
            <div className="h-12 w-12 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
            <h4 className="text-xl font-bold text-white">Financeiro Automatizado</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Monitore saldo real, receitas e despesas automaticamente. Sem complicação de cálculos fiscais ou erros manuais.
            </p>
          </motion.div>

          {/* Card 2: Inventory */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="bg-slate-950 border border-slate-800 p-8 rounded-2xl space-y-4 hover:border-indigo-500/50 transition-all"
          >
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Package className="h-6 w-6" />
            </div>
            <h4 className="text-xl font-bold text-white">Estoque Inteligente</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Saiba exatamente quando reabastecer com alertas de estoque crítico e baixas automáticas a cada venda efetuada.
            </p>
          </motion.div>

          {/* Card 3: Reports */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="bg-slate-950 border border-slate-800 p-8 rounded-2xl space-y-4 hover:border-indigo-500/50 transition-all"
          >
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h4 className="text-xl font-bold text-white">Relatórios Gerenciais</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Exporte dados em PDF ou CSV com apenas um clique. Monitore lucros e crescimento em painéis interativos.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="bg-slate-950/50 py-24 px-6 border-y border-slate-800">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Fluxo Simples</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Sua empresa rodando em 3 passos</h3>
            <p className="text-slate-400 leading-relaxed">
              O design limpo e intuitivo reduz a curva de aprendizado da equipe a praticamente zero.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500/5 via-indigo-500/20 to-indigo-500/5 -translate-y-1/2 hidden md:block" />
            
            {/* Step 1 */}
            <div className="space-y-4 text-center z-10">
              <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg mx-auto shadow-lg shadow-indigo-600/35">
                1
              </div>
              <h4 className="text-lg font-bold text-white">Importe ou Cadastre</h4>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                Cadastre clientes, insira produtos, defina preços de custo, preços de venda e quantidade em estoque.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 text-center z-10">
              <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg mx-auto shadow-lg shadow-indigo-600/35">
                2
              </div>
              <h4 className="text-lg font-bold text-white">Registre Transações</h4>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                Registre as vendas no pdv digital. O sistema calcula o total e atualiza as receitas e o estoque automaticamente.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 text-center z-10">
              <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg mx-auto shadow-lg shadow-indigo-600/35">
                3
              </div>
              <h4 className="text-lg font-bold text-white">Monitore e Lucre</h4>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                Acompanhe gráficos mensais de fluxo de caixa e exporte relatórios para contabilidade em tempo recorde.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Competive Differentiators Grid */}
      <section id="diferenciais" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Segurança & Performance</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Feito para suportar o crescimento da sua empresa</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Mais do que um ERP básico, o Leal ERP utiliza tecnologia de ponta para garantir carregamentos rápidos, segurança militar de dados e auditoria contínua de movimentações.
            </p>
            
            <ul className="space-y-3.5">
              <li className="flex items-center gap-3 text-sm">
                <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>Autenticação de usuários criptografada</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>Histórico de transações imutável para contabilidade</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>Exportação para múltiplos formatos (Excel, PDF)</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-2">
              <Shield className="h-7 w-7 text-indigo-400" />
              <h4 className="text-md font-bold text-white">LGPD Compliance</h4>
              <p className="text-slate-400 text-xs">Dados e cadastros de clientes 100% protegidos.</p>
            </div>
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-2">
              <Activity className="h-7 w-7 text-emerald-400" />
              <h4 className="text-md font-bold text-white">Fast-Load</h4>
              <p className="text-slate-400 text-xs">Infraestrutura Next.js de carregamento instantâneo.</p>
            </div>
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-2">
              <Layers className="h-7 w-7 text-purple-400" />
              <h4 className="text-md font-bold text-white">API Pronta</h4>
              <p className="text-slate-400 text-xs">Fácil integração com outros canais de vendas (SaaS).</p>
            </div>
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-2">
              <Users className="h-7 w-7 text-amber-400" />
              <h4 className="text-md font-bold text-white">Multi-Usuários</h4>
              <p className="text-slate-400 text-xs">Criação de perfis distintos com níveis de acesso.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-950/40 py-24 px-6 border-y border-slate-800">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Depoimentos</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">O que dizem os donos de negócios</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-slate-300 text-sm italic">
                &quot;Substituímos três planilhas financeiras complexas pelo Leal ERP. Hoje minha equipe faz vendas e dá baixa no estoque de forma instantânea. O faturamento subiu 15%!&quot;
              </p>
              <div>
                <p className="text-sm font-bold text-white">Gustavo Pinheiro</p>
                <p className="text-xs text-slate-500">CEO, Pinheiro Imports</p>
              </div>
            </div>

            <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-slate-300 text-sm italic">
                &quot;O controle de estoque crítico mudou nossa forma de operar. Nunca mais perdemos vendas por falta de mercadoria nas prateleiras ou atraso de fornecedor.&quot;
              </p>
              <div>
                <p className="text-sm font-bold text-white">Carla Vasconcelos</p>
                <p className="text-xs text-slate-500">Diretora de Logística, Casa & Cozinha</p>
              </div>
            </div>

            <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-slate-300 text-sm italic">
                &quot;Gostei muito da simplicidade do sistema. Em menos de 20 minutos conseguimos cadastrar toda a carteira de clientes ativos e emitir as vendas pendentes.&quot;
              </p>
              <div>
                <p className="text-sm font-bold text-white">Márcio Sant&apos;Anna</p>
                <p className="text-xs text-slate-500">Fundador, Sant&apos;Anna Solutions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Planos de Assinatura</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Planos transparentes e sem pegadinhas</h3>
          <p className="text-slate-400 leading-relaxed">
            Comece a usar grátis em nosso ambiente de testes e escolha o plano ideal para sua escala operacional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan 1 */}
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-slate-400">Starter</h4>
              <p className="text-xs text-slate-500">Ideal para MEIs e pequenos autônomos</p>
              <div className="text-3xl font-black text-white">Grátis <span className="text-sm font-normal text-slate-500">/ sempre</span></div>
              <div className="h-px bg-slate-900 my-4" />
              <ul className="space-y-3.5 text-sm text-slate-400">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> Até 50 clientes ativos</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> Controle básico de estoque</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> Registro de até 100 vendas/mês</li>
              </ul>
            </div>
            <Link href="/login" className="mt-8">
              <Button className="w-full border border-slate-700 bg-transparent hover:bg-slate-800 text-white py-5">Começar Agora</Button>
            </Link>
          </div>

          {/* Plan 2: Best Value */}
          <div className="bg-slate-950 border-2 border-indigo-600 p-8 rounded-2xl flex flex-col justify-between relative shadow-xl shadow-indigo-600/10">
            <span className="absolute -top-3.5 right-6 bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full">Mais Vendido</span>
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-indigo-400">Pro Business</h4>
              <p className="text-xs text-slate-500">Para empresas em rápido crescimento</p>
              <div className="text-3xl font-black text-white">R$ 149 <span className="text-sm font-normal text-slate-500">/ mês</span></div>
              <div className="h-px bg-slate-900 my-4" />
              <ul className="space-y-3.5 text-sm text-slate-400">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> Clientes e produtos ilimitados</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> Alertas avançados de estoque crítico</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> Relatórios gerenciais e fluxo de caixa</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> Suporte prioritário via WhatsApp</li>
              </ul>
            </div>
            <Link href="/login" className="mt-8">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5">Contratar Plano Pro</Button>
            </Link>
          </div>

          {/* Plan 3 */}
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-slate-400">Corporate</h4>
              <p className="text-xs text-slate-500">Para operações complexas e customizadas</p>
              <div className="text-3xl font-black text-white">Sob consulta</div>
              <div className="h-px bg-slate-900 my-4" />
              <ul className="space-y-3.5 text-sm text-slate-400">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> Integração customizada via API</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> Níveis avançados de acessos e cargos</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-400" /> Gerente de conta dedicado</li>
              </ul>
            </div>
            <Link href="/login" className="mt-8">
              <Button className="w-full border border-slate-700 bg-transparent hover:bg-slate-800 text-white py-5">Falar com Consultor</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Perguntas Frequentes</h2>
          <h3 className="text-3xl font-extrabold tracking-tight">Tire suas dúvidas</h3>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Preciso de cartão de crédito para testar?",
              a: "Não. Você pode acessar nosso painel de demonstração gratuitamente de forma imediata apenas clicando no botão de login administrativo."
            },
            {
              q: "Os dados ficam armazenados na nuvem de forma segura?",
              a: "Sim. Nossos servidores de banco de dados corporativos operam com criptografia AES-256 e backups automáticos diários redundantes na AWS."
            },
            {
              q: "É possível migrar dados de outro ERP ou planilhas?",
              a: "Com certeza. O Leal ERP possui ferramentas de importação em lote compatíveis com CSV e planilhas comuns do Excel para acelerar seu setup."
            },
            {
              q: "Posso cancelar minha assinatura a qualquer momento?",
              a: "Sim. Não exigimos contratos de fidelidade. Você pode assinar mensalmente e cancelar sua assinatura diretamente no painel de configurações."
            }
          ].map((item, index) => (
            <div key={index} className="bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden">
              <button 
                className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-900/60 transition-colors"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-bold text-white text-md">{item.q}</span>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${activeFaq === index ? 'rotate-180 text-white' : ''}`} />
              </button>
              
              <AnimatePresence>
                {activeFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 pt-2 text-slate-400 text-sm leading-relaxed border-t border-slate-900/50">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Strong Final CTA */}
      <section className="py-24 px-6 relative overflow-hidden bg-indigo-900/40 border-t border-slate-800 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-8 relative z-10 flex flex-col items-center">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Chegou a hora de descomplicar a gestão da sua empresa
          </h2>
          <p className="text-indigo-200 text-lg max-w-xl font-normal leading-relaxed">
            Junte-se a milhares de administradores e leve seu controle operacional para o próximo nível.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-white hover:bg-slate-100 text-indigo-950 font-bold px-10 py-7 rounded-xl shadow-2xl text-md flex items-center gap-2 group transition-all">
              Começar Demonstração Gratuita
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Complete Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-16 px-6 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm">
                L
              </div>
              <span className="font-extrabold text-md text-white">Leal ERP</span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs">
              SaaS ERP projetado para acelerar processos, garantir controle de estoque físico e simplificar lançamentos contábeis.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase text-xs tracking-widest">Produto</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#beneficios" className="hover:text-slate-300">Recursos</a></li>
              <li><a href="#precos" className="hover:text-slate-300">Planos</a></li>
              <li><a href="#faq" className="hover:text-slate-300">FAQs</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase text-xs tracking-widest">Suporte</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-slate-300">WhatsApp Comercial</a></li>
              <li><a href="#" className="hover:text-slate-300">Email de Contato</a></li>
              <li><a href="#" className="hover:text-slate-300">Central de Ajuda</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase text-xs tracking-widest">Legal</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-slate-300">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-slate-300">Termos de Serviço</a></li>
              <li><a href="#" className="hover:text-slate-300">Segurança de Dados</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto h-px bg-slate-900 my-12" />

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <span>&copy; {new Date().getFullYear()} Leal ERP. Todos os direitos reservados.</span>
          <span className="flex gap-4">
            <a href="#" className="hover:text-white">LinkedIn</a>
            <a href="#" className="hover:text-white">Instagram</a>
            <a href="#" className="hover:text-white">GitHub</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
