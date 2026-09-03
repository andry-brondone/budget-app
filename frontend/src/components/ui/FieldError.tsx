export const FieldError = ({ message }: { message: string | undefined }) => {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{message}</p>;
};
