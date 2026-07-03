import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';

export default function PrivacyPage() {
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
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Política de Privacidade</h1>
          <div className="mt-10 space-y-7 leading-7 text-[#5f6d68]">
            <p>Esta página resume como o Leal ERP trata os dados necessários para autenticação e funcionamento da aplicação.</p>
            <section><h2 className="font-semibold text-[#18332c]">Dados coletados</h2><p className="mt-2">Email de acesso, dados de perfil e informações empresariais inseridas pelo próprio usuário nos módulos do sistema.</p></section>
            <section><h2 className="font-semibold text-[#18332c]">Finalidade</h2><p className="mt-2">Os dados são usados para autenticar a conta, manter os registros do ERP e disponibilizar as funcionalidades solicitadas.</p></section>
            <section><h2 className="font-semibold text-[#18332c]">Armazenamento</h2><p className="mt-2">A autenticação e o banco de dados utilizam a infraestrutura do Supabase. Cada conta acessa seus próprios registros conforme as políticas configuradas no sistema.</p></section>
            <section><h2 className="font-semibold text-[#18332c]">Cookies</h2><p className="mt-2">São utilizados cookies estritamente necessários para manter a sessão autenticada. Não há cookies publicitários configurados atualmente.</p></section>
            <section><h2 className="font-semibold text-[#18332c]">Contato</h2><p className="mt-2">Solicitações sobre dados pessoais podem ser enviadas para contato@lealerp.com.br.</p></section>
          </div>
        </article>
      </div>
    </main>
  );
}
