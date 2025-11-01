import { userCredentialsSchema } from "@advanced-react/shared/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/features/shared/components/ui/Form";
import Input from "@/features/shared/components/ui/Input";
import { Button } from "@/features/shared/components/ui/Button";
import { trpc } from "@/trpc";
import { useToast } from "@/features/shared/hooks/useToast";
import { router } from "@/router";
import Link from "@/features/shared/components/ui/Link";

const registerCredentialsSchema = userCredentialsSchema;
type RegisterFormData = z.infer<typeof registerCredentialsSchema>;

export function RegisterForm() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerCredentialsSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onError: (error) => {
      toast({
        title: "Failed to register",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: async (data) => {
      // Set the currentUser query data with the registration response
      await utils.auth.currentUser.invalidate();

      form.reset();

      router.navigate({ to: "/" });

      toast({
        title: "Registered successfully",
        description: "You are now registered",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    registerMutation.mutate(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} type="text" placeholder="John Doe" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="dev@example.come" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" placeholder="********" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? "Registering..." : "Register"}
        </Button>

        <div className="flex justify-center">
          <Link to="/login" variant="ghost" className="hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </form>
    </Form>
  );
}
