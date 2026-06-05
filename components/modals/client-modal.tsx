'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema } from '@/lib/validations/schemas';
import { useApp } from '@/lib/context/AppContext';
import { Client } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientToEdit?: Client | null;
}

type ClientFormValues = Omit<Client, 'id' | 'createdAt'>;

export function ClientModal({ open, onOpenChange, clientToEdit }: ClientModalProps) {
  const { addClient, updateClient } = useApp();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      document: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  // Reset form when modal opens/closes or changes edit target
  useEffect(() => {
    if (open) {
      if (clientToEdit) {
        reset({
          name: clientToEdit.name,
          document: clientToEdit.document,
          phone: clientToEdit.phone,
          email: clientToEdit.email,
          address: clientToEdit.address,
        });
      } else {
        reset({
          name: '',
          document: '',
          phone: '',
          email: '',
          address: '',
        });
      }
    }
  }, [open, clientToEdit, reset]);

  const onSubmit = (data: ClientFormValues) => {
    if (clientToEdit) {
      updateClient(clientToEdit.id, data);
    } else {
      addClient(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{clientToEdit ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="name">Nome / Razão Social</Label>
            <Input id="name" placeholder="Ex: Tech Solutions Ltda" {...register('name')} />
            {errors.name && (
              <p className="text-xs font-semibold text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="document">CPF ou CNPJ</Label>
              <Input id="document" placeholder="Apenas números" {...register('document')} />
              {errors.document && (
                <p className="text-xs font-semibold text-destructive">{errors.document.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Telefone / Celular</Label>
              <Input id="phone" placeholder="Ex: 11999998888" {...register('phone')} />
              {errors.phone && (
                <p className="text-xs font-semibold text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email de Contato</Label>
            <Input id="email" type="email" placeholder="financeiro@empresa.com" {...register('email')} />
            {errors.email && (
              <p className="text-xs font-semibold text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="address">Endereço Completo</Label>
            <Input id="address" placeholder="Av. Paulista, 1000 - São Paulo, SP" {...register('address')} />
            {errors.address && (
              <p className="text-xs font-semibold text-destructive">{errors.address.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {clientToEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
