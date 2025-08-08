
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Feedback {
    id: string;
    recommendationId: string;
    rating: 'up' | 'down';
    role: string;
    domain: string; 
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
        const q = query(collection(db, 'feedback'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                setLoading(false);
                return;
            }
            // In a real app, you would fetch recommendation text and domain info
            // based on the recommendationId. Here we simulate it.
            const fetchedFeedback = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    recommendationId: data.recommendationId,
                    rating: data.rating,
                    role: data.role,
                    domain: 'Unknown', // This would require a lookup
                    recommendationText: `Rec ID: ${data.recommendationId}`, // This would require a lookup
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
    }, []);

    const processedData = () => {
        if (feedback.length === 0) return { byRole: [], topLiked: [], topDisliked: [] };

        const byRole: { [key: string]: { up: number, down: number } } = {};
        const byRecommendation: { [key: string]: { text: string, up: number, down: number } } = {};

        feedback.forEach(f => {
            if (!byRole[f.role]) byRole[f.role] = { up: 0, down: 0 };
            if (!byRecommendation[f.recommendationId]) {
                 byRecommendation[f.recommendationId] = { text: f.recommendationText, up: 0, down: 0 };
            }

            if (f.rating === 'up') {
                byRole[f.role].up++;
                byRecommendation[f.recommendationId].up++;
            } else {
                byRole[f.role].down++;
                byRecommendation[f.recommendationId].down++;
            }
        });

        const roleChartData = Object.entries(byRole).map(([name, { up, down }]) => ({ name, upvotes: up, downvotes: down }));
        
        const recommendationList = Object.values(byRecommendation);
        const topLiked = [...recommendationList].sort((a,b) => b.up - a.up).slice(0, 5);
        const topDisliked = [...recommendationList].sort((a,b) => b.down - a.down).slice(0, 5);


        return { byRole: roleChartData, topLiked, topDisliked };
    };

    const { byRole, topLiked, topDisliked } = processedData();

    if (loading) {
        return (
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <Skeleton className="h-80" />
                 <Skeleton className="h-80" />
                 <Skeleton className="h-80" />
             </div>
        );
    }
    
    if (feedback.length === 0) {
        return (
             <Card>
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
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Feedback by Role</CardTitle>
                    <CardDescription>How different strategist roles are rating AI recommendations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={byRole}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                            <YAxis stroke="hsl(var(--muted-foreground))" />
                            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                            <Bar dataKey="upvotes" fill={COLORS.up} name="Approvals" stackId="a" />
                            <Bar dataKey="downvotes" fill={COLORS.down} name="Rejections" stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Top Approved</CardTitle>
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
                    <CardTitle>Top Rejected</CardTitle>
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

