"use client"

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import {z} from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, Form, FormMessage } from '@/components/ui/form'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import {ScaleLoader} from "react-spinners"

const schema = z.object({
	login: z.string().min(3, "Логин слишком короткий!").max(50, "Логин слишком длинный!"),
	password: z.string().min(6, "Пароль слишком короткий!").max(100, "Пароль слишком длинный!"),
})

export default function About() {
	const [loading, setLoading] = useState(false);
	const form = useForm<z.infer<typeof schema>>({
	resolver: zodResolver(schema),
		mode: "onBlur",
		defaultValues: {
			login: "",
			password: "",
		},
  	});

	async function onSubmit(values: z.infer<typeof schema>) {
		setLoading(true);
		const result = await signIn("credentials", {
			login: values.login,
			password: values.password,
			redirect: false,
		})
		setLoading(false);
		console.log(result);
		if (result?.ok) {
			toast.success("Вы успешно вошли в систему!", {
				position: "top-center",
			});
			window.location.href = "/dashboard";
		} else {
			toast.error("Ошибка авторизации! ", {
				style: {color: "#721c24"},
				position: "top-center",
			})
		}

	}

	return (
		<div className="flex items-center justify-center min-h-screen">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className='w-md min-h-40 border-2 rounded-2xl border-foreground p-5'>
					<div className='text-foreground text-2xl font-semibold text-center mb-5'>Авторизация</div>
					<FormField  
						control={form.control}
						name='login'
						render={({ field }) => (
							<FormItem className='mb-3'>
								<FormControl>
									<Input placeholder='Логин' {...field}/>
								</FormControl>
								<FormMessage className='text-red-500' />
							</FormItem>
					)}/>
					<FormField 
						control={form.control}
						name='password'
						render={({ field }) => (
							<FormItem className='mb-3'>
								<FormControl>
									<Input placeholder='Пароль' type="password" {...field}/>
								</FormControl>
								<FormMessage className='text-red-500' />
							</FormItem>
					)}/>					
					<div className='flex items-center gap-4'>
						<Button type='submit' className='cursor-pointer'>Войти</Button>
						{loading && <ScaleLoader height={20} className='text-foreground' />}
					</div>
				</form>

			</Form>
		</div>
  )
}
