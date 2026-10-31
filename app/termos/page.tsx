import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f5f1e8] px-5 py-10 text-[#18332c] sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <Link href="/"><BrandLogo /></Link>
          <Link href="/" className="flex items-center gap-2 text-sm text-[#68736f]">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </div>
        <article className="mt-20 rounded-[28px] border border-[#ded8cd] bg-white p-7 sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a66c22]">Informações legais</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Termos de Uso</h1>
          <div className="mt-10 space-y-7 leading-7 text-[#5f6d68]">
            <p>Ao criar uma conta, o usuário concorda em utilizar o Leal ERP de forma lícita e manter suas credenciais protegidas.</p>
            <section><h2 className="font-semibold text-[#18332c]">Responsabilidade pelos dados</h2><p className="mt-2">O usuário é responsável pela exatidão das informações cadastradas e por revisar os resultados antes de utilizá-los em decisões fiscais, contábeis ou comerciais.</p></section>
            <section><h2 className="font-semibold text-[#18332c]">Disponibilidade</h2><p className="mt-2">O produto está em evolução. Funcionalidades podem ser aprimoradas e períodos de manutenção podem ocorrer sem que sejam feitas garantias irreais de disponibilidade.</p></section>
            <section><h2 className="font-semibold text-[#18332c]">Uso adequado</h2><p className="mt-2">Não é permitido tentar acessar dados de terceiros, explorar falhas ou utilizar o serviço para atividades ilegais.</p></section>
            <section><h2 className="font-semibold text-[#18332c]">Contato</h2><p className="mt-2">Dúvidas sobre estes termos podem ser enviadas para contato@lealerp.com.br.</p></section>
          </div>
        </article>
      </div>
    </main>
  );
}
