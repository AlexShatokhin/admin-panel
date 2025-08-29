"use client";

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { ScaleLoader } from 'react-spinners';
import z from 'zod'

const schema = z.object({
	title: z.string().min(3, "Название задачи должно содержать как минимум 3 символа"),
	description: z.string().min(5, "Описание задачи должно содержать как минимум 5 символов"),
	assignedTo: z.array(z.string()).min(0, "Вы должны назначить задачу как минимум одному пользователю")

})

export default function TaskForm() {
	const loading = true;
	const form = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: {
			title: "",
			description: "",
			assignedTo: []
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
					<Button className='absolute top-8 right-8 cursor-pointer'><Plus/> Add task</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add task</DialogTitle>
					</DialogHeader>
					<Form {...form}>
						<FormField
							control={form.control}
							name="title"
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
							name="description"
							render={({ field }) => (
								<FormItem className='mb-1'>
									<FormControl>
										<Input placeholder='Описание задачи' {...field}/>
									</FormControl>
									<FormMessage className='text-red-500' />
								</FormItem>							
							)}
						/>
						<FormField
							control={form.control}
							name="assignedTo"
							render={({ field }) => (
								<FormItem className='mb-1'>
									<FormControl>
										<select className='border rounded-md p-2 focus:outline-none focus:shadow-outline' {...field}>
											<option value="empty">Никто не выбран</option>
											<option value="user1">Пользователь 1</option>
											<option value="user2">Пользователь 2</option>
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
