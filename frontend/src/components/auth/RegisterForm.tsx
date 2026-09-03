import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { registerFormSchema, type RegisterFormValues } from '@/schemas/auth.schema';
import { useRegister } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { FieldError } from '@/components/ui/FieldError';

export const RegisterForm = () => {
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) });

  const onSubmit = handleSubmit((values) => {
    registerUser.mutate(values);
  });

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="name">Nom complet</Label>
        <Input id="name" placeholder="Rakoto Jean" {...register('name')} />
        <FieldError message={errors.name?.message} />
      </div>

      <div>
        <Label htmlFor="email">Email (optionnel si téléphone renseigné)</Label>
        <Input id="email" placeholder="vous@email.com" {...register('email')} />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <Label htmlFor="phone">Téléphone (optionnel si email renseigné)</Label>
        <Input id="phone" placeholder="034 12 345 67" {...register('phone')} />
        <FieldError message={errors.phone?.message} />
      </div>

      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
        <FieldError message={errors.password?.message} />
      </div>

      <Button type="submit" isLoading={registerUser.isPending}>
        Créer mon compte
      </Button>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Déjà un compte ?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
          Se connecter
        </Link>
      </p>
    </form>
  );
};
