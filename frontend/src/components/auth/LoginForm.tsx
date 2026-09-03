import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { loginFormSchema, type LoginFormValues } from '@/schemas/auth.schema';
import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { FieldError } from '@/components/ui/FieldError';

export const LoginForm = () => {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values);
  });

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="identifier">Email ou téléphone</Label>
        <Input
          id="identifier"
          placeholder="034 12 345 67 ou vous@email.com"
          {...register('identifier')}
        />
        <FieldError message={errors.identifier?.message} />
      </div>

      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
        <FieldError message={errors.password?.message} />
      </div>

      <Button type="submit" isLoading={login.isPending}>
        Se connecter
      </Button>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Pas encore de compte ?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
          Créer un compte
        </Link>
      </p>
    </form>
  );
};
