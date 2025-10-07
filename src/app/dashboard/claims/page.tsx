
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Claim, ClaimStatus, ClaimSeverity } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

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


export default function ClaimsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const [updatedStatus, setUpdatedStatus] = useState<ClaimStatus | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchClaims = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('/api/disciplinarian/claims', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch claims.');
      const data = await response.json();
      setClaims(data);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleViewDetails = async (claimId: string) => {
    try {
      const response = await fetch(`/api/disciplinarian/claims/${claimId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if(!response.ok) throw new Error('Failed to fetch claim details.');
      const data = await response.json();
      setSelectedClaim(data);
      setUpdatedStatus(data.status);
      setResolutionNote(data.resolutionNote || '');
      setIsDetailsOpen(true);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  }

  const handleUpdateClaim = async () => {
    if (!selectedClaim || !updatedStatus) return;
    setIsUpdating(true);
    try {
        const response = await fetch(`/api/disciplinarian/claims/${selectedClaim.id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                status: updatedStatus,
                resolutionNote: resolutionNote
            })
        });

        if (!response.ok) throw new Error('Failed to update claim.');
        
        toast({ title: 'Success', description: 'Claim has been updated.' });
        setIsDetailsOpen(false);
        fetchClaims(); // Refresh the list
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsUpdating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-headline">Manage Claims</h1>
        <p className="text-muted-foreground">
          Review and resolve claims submitted by choir members.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Submitted Claims</CardTitle>
          <CardDescription>
            Here is a list of all claims. Click on a row to view details and take action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submitted By</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Loading claims...</TableCell></TableRow>
              ) : claims.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center">No claims have been submitted.</TableCell></TableRow>
              ) : (
                claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                          <Image
                              src={claim.submittedBy.profileImage || `https://picsum.photos/seed/${claim.submittedById}/40/40`}
                              width={40}
                              height={40}
                              alt={claim.isAnonymous ? 'Anonymous' : `${claim.submittedBy.firstName} ${claim.submittedBy.lastName}`}
                              className="rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium">{claim.isAnonymous ? 'Anonymous' : `${claim.submittedBy.firstName} ${claim.submittedBy.lastName}`}</p>
                          </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{claim.title}</TableCell>
                    <TableCell><Badge variant={getSeverityBadgeVariant(claim.severity)}>{claim.severity}</Badge></TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(claim.status)}>{claim.status}</Badge></TableCell>
                    <TableCell>{formatDistanceToNow(new Date(claim.createdAt), { addSuffix: true })}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(claim.id)}>View Details</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
            <DialogDescription>
              Review the claim and update its status or add resolution notes.
            </DialogDescription>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
              <p><strong>Title:</strong> {selectedClaim.title}</p>
              <p><strong>Description:</strong> {selectedClaim.description}</p>
              <p><strong>Severity:</strong> <Badge variant={getSeverityBadgeVariant(selectedClaim.severity)}>{selectedClaim.severity}</Badge></p>
              <p><strong>Submitted:</strong> {format(new Date(selectedClaim.createdAt), 'PPP p')}</p>
              {selectedClaim.attachment && (
                  <p><strong>Attachment:</strong> <Button asChild variant="link"><Link href={selectedClaim.attachment} target="_blank">View Attachment</Link></Button></p>
              )}
              <div className="space-y-2">
                <Label htmlFor="status">Update Status</Label>
                <Select value={updatedStatus || selectedClaim.status} onValueChange={(value) => setUpdatedStatus(value as ClaimStatus)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_REVIEW">In Review</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="resolutionNote">Resolution Note</Label>
                  <Textarea id="resolutionNote" value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)} placeholder="Add your notes here..."/>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDetailsOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateClaim} disabled={isUpdating}>{isUpdating ? 'Updating...' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
