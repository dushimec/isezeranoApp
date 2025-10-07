
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Claim, ClaimSeverity, ClaimStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';

const getStatusBadgeVariant = (status: ClaimStatus) => {
    switch (status) {
        case 'PENDING': return 'secondary';
        case 'IN_REVIEW': return 'default';
        case 'RESOLVED': return 'outline';
        case 'REJECTED': return 'destructive';
        default: return 'secondary';
    }
}

const getSeverityBadgeVariant = (severity: ClaimSeverity) => {
    switch (severity) {
        case 'LOW': return 'secondary';
        case 'MEDIUM': return 'default';
        case 'HIGH': return 'destructive';
        default: return 'secondary';
    }
}

type FormInputs = {
    title: string;
    description: string;
    severity: ClaimSeverity;
    isAnonymous: boolean;
    attachment?: FileList;
};

export default function MyClaimsPage() {
    const { token } = useAuth();
    const { toast } = useToast();
    const [myClaims, setMyClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>();

    const fetchMyClaims = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch('/api/singer/claims', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch your claims.');
            const data = await response.json();
            setMyClaims(data);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    }, [token, toast]);

    useEffect(() => {
        fetchMyClaims();
    }, [fetchMyClaims]);

    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        setIsSubmitting(true);
        let attachmentDataUri;
        if (data.attachment && data.attachment.length > 0) {
            try {
                attachmentDataUri = await fileToDataUri(data.attachment[0]);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to read attachment file.' });
                setIsSubmitting(false);
                return;
            }
        }
        
        try {
            const response = await fetch('/api/singer/claims', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...data, attachment: attachmentDataUri })
            });
            if (!response.ok) throw new Error('Failed to submit claim.');
            toast({ title: 'Success', description: 'Your claim has been submitted.' });
            reset();
            setIsCreateOpen(false);
            fetchMyClaims();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center">
                <div className="flex-1">
                    <h1 className="text-3xl font-headline">My Submitted Claims</h1>
                    <p className="text-muted-foreground">
                        Track the status of your submitted claims or file a new one.
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Submit a New Claim
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Submit a New Claim</DialogTitle>
                            <DialogDescription>
                                Describe the issue you are facing. It will be reviewed by a disciplinarian.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" {...register('title', { required: true })} />
                                {errors.title && <p className="text-destructive text-sm mt-1">Title is required.</p>}
                            </div>
                             <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" {...register('description', { required: true })} />
                                {errors.description && <p className="text-destructive text-sm mt-1">Description is required.</p>}
                            </div>
                             <div>
                                <Label htmlFor="severity">Severity</Label>
                                <select id="severity" {...register('severity')} className="w-full h-10 border rounded-md px-3">
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="attachment">Attachment (Optional)</Label>
                                <Input id="attachment" type="file" {...register('attachment')} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="isAnonymous" {...register('isAnonymous')} />
                                <Label htmlFor="isAnonymous">Submit Anonymously</Label>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Your Claim History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} className="text-center">Loading your claims...</TableCell></TableRow>
                            ) : myClaims.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center">You have not submitted any claims.</TableCell></TableRow>
                            ) : (
                                myClaims.map(claim => (
                                    <TableRow key={claim.id}>
                                        <TableCell className="font-medium">{claim.title}</TableCell>
                                        <TableCell><Badge variant={getSeverityBadgeVariant(claim.severity)}>{claim.severity}</Badge></TableCell>
                                        <TableCell><Badge variant={getStatusBadgeVariant(claim.status)}>{claim.status}</Badge></TableCell>
                                        <TableCell>{formatDistanceToNow(new Date(claim.createdAt), { addSuffix: true })}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
