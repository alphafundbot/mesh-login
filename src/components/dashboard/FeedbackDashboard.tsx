
"use client";

import { useState, useEffect, useMemo } from 'react';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, onSnapshot, Timestamp, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { ThumbsUp, ThumbsDown, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Feedback {
    id: string;
    recommendationId: string;
    rating: 'up' | 'down';
    role: string;
    recommendationText: string; 
    timestamp: Date;
}

const COLORS = {
    up: 'hsl(var(--chart-2))',
    down: 'hsl(var(--destructive))',
};

export default function FeedbackDashboard() {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const authUnsubscribe = onAuthStateChanged(auth, (user) => {
            if(user) {
                const q = query(collection(db, 'feedback'), orderBy("timestamp", "desc"));
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    if (snapshot.empty) {
                        setLoading(false);
                        return;
                    }
                    const fetchedFeedback = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            recommendationId: data.recommendationId,
                            rating: data.rating,
                            role: data.role,
                            recommendationText: data.recommendationText || `Rec ID: ${data.recommendationId}`,
                            timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
                        } as Feedback;
                    });
                    setFeedback(fetchedFeedback);
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching feedback:", error);
                    setLoading(false);
                });

                return () => unsubscribe();
            } else {
                setLoading(false);
            }
        });
        return () => authUnsubscribe();
    }, []);

    const { byRole, topLiked, topDisliked } = useMemo(() => {
        if (feedback.length === 0) return { byRole: [], topLiked: [], topDisliked: [] };

        const roleMap: { [key: string]: { up: number, down: number } } = {};
        const recommendationMap: { [key: string]: { text: string, up: number, down: number } } = {};

        feedback.forEach(f => {
            if (!roleMap[f.role]) roleMap[f.role] = { up: 0, down: 0 };
            if (!recommendationMap[f.recommendationId]) {
                 recommendationMap[f.recommendationId] = { text: f.recommendationText, up: 0, down: 0 };
            }

            if (f.rating === 'up') {
                roleMap[f.role].up++;
                recommendationMap[f.recommendationId].up++;
            } else {
                roleMap[f.role].down++;
                recommendationMap[f.recommendationId].down++;
            }
        });

        const roleChartData = Object.entries(roleMap).map(([name, { up, down }]) => ({ name, Approvals: up, Rejections: down }));
        
        const recommendationList = Object.values(recommendationMap);
        const topLiked = [...recommendationList].sort((a,b) => b.up - a.up).slice(0, 5);
        const topDisliked = [...recommendationList].sort((a,b) => b.down - a.down).slice(0, 5);

        return { byRole: roleChartData, topLiked, topDisliked };
    }, [feedback]);

    if (loading) {
        return (
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <Skeleton className="h-80 col-span-1 lg:col-span-3" />
                 <Skeleton className="h-80" />
                 <Skeleton className="h-80" />
                 <Skeleton className="h-80" />
             </div>
        );
    }
    
    if (feedback.length === 0) {
        return (
             <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                    <CardTitle>Strategist Feedback Dashboard</CardTitle>
                    <CardDescription>No feedback data available yet. Please interact with AI recommendations to see insights here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">Awaiting strategist feedback...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-6 auto-rows-max md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5 text-accent" />Feedback by Role</CardTitle>
                    <CardDescription>How different strategist roles are rating AI recommendations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={byRole}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                            <Legend />
                            <Bar dataKey="Approvals" fill={COLORS.up} stackId="a" />
                            <Bar dataKey="Rejections" fill={COLORS.down} stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-400"><ThumbsUp className="h-5 w-5" />Top Approved</CardTitle>
                    <CardDescription>The most effective AI recommendations based on strategist feedback.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {topLiked.map(rec => (
                        <div key={rec.text} className="text-xs p-2 rounded-md bg-muted/30">
                            <p className="text-muted-foreground truncate">"{rec.text}"</p>
                            <div className="flex items-center justify-end gap-2 text-green-400 font-semibold">
                                <ThumbsUp className="h-3 w-3" /> {rec.up}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-400"><ThumbsDown className="h-5 w-5" />Top Rejected</CardTitle>
                    <CardDescription>Recommendations needing recalibration or suppression.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {topDisliked.map(rec => (
                        <div key={rec.text} className="text-xs p-2 rounded-md bg-muted/30">
                            <p className="text-muted-foreground truncate">"{rec.text}"</p>
                            <div className="flex items-center justify-end gap-2 text-red-400 font-semibold">
                                <ThumbsDown className="h-3 w-3" /> {rec.down}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
