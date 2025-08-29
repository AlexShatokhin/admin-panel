"use client";

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input';
import { RoleEnum } from '@/types/RoleEnum';
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { ScaleLoader } from 'react-spinners';
import z from 'zod'

const schema = z.object({
	login: z.string().min(3, "Имя должен содержать минимум 3 символа"),
	name: z.string().min(5, "Логин должно содержать минимум 5 символов"),
	password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
	role: z.enum(RoleEnum)
})

export default function WorkersForm() {
	const loading = true;
	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			login: "",
			name: "",
			password: "",
			role: RoleEnum.WORKER
		},
		mode: "onBlur"
	});

    const onSubmitHandler = async () => {
        console.log(form.getValues());
		const response = await fetch("/api/tasks", {
			method: "POST",
			body: JSON.stringify(form.getValues()),
			headers: {
				"Content-Type": "application/json"
			}
		})
		console.log(response);
        form.reset();
    }

  	return (
	<>
		<Dialog>
			<form>
				<DialogTrigger asChild>
					<Button className='absolute top-8 right-8 cursor-pointer'><Plus/> Add worker</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add worker</DialogTitle>
					</DialogHeader>
					<Form {...form}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className='mb-1'>
									<FormControl>
										<Input placeholder='Имя' {...field}/>
									</FormControl>
									<FormMessage className='text-red-500' />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="login"
							render={({ field }) => (
								<FormItem className='mb-1'>
									<FormControl>
										<Input placeholder='Логин' {...field}/>
									</FormControl>
									<FormMessage className='text-red-500' />
								</FormItem>							
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem className='mb-1'>
									<FormControl>
										<Input placeholder='Пароль' {...field}/>
									</FormControl>
									<FormMessage className='text-red-500' />
								</FormItem>							
							)}
						/>
						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem className='mb-1'>
									<FormControl>
										<select className='border rounded-md p-2 focus:outline-none focus:shadow-outline' {...field}>
											<option value={RoleEnum.WORKER}>Работник</option>
											<option value={RoleEnum.MANAGER}>Руководитель</option>
											<option value={RoleEnum.ADMIN}>Администратор</option>
										</select>
									</FormControl>
									<FormMessage className='text-red-500' />
								</FormItem>							
							)}
						/>                        
						<div className='flex items-center gap-4'>
							<Button onClick={onSubmitHandler} type='submit' className='cursor-pointer'>Войти</Button>
							{loading && <ScaleLoader height={20} className='text-foreground' />}
						</div>																	
					</Form>
				</DialogContent>
			</form>
		</Dialog>
	</>
  )
}
