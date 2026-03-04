
"use client";

import React, { useState } from "react";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Mail, Calendar, Trash2, CheckCircle, Search, LogIn, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { firestore, user, auth } = useFirebase();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const submissionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "contactSubmissions"), orderBy("submissionDateTime", "desc"));
  }, [firestore]);

  const { data: submissions, isLoading, error } = useCollection(submissionsQuery);

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(firestore, "contactSubmissions", id));
    toast({ title: "Submission Deleted", description: "Record has been removed from the system." });
  };

  const markAsRead = (id: string) => {
    updateDocumentNonBlocking(doc(firestore, "contactSubmissions", id), { status: "read" });
    toast({ title: "Status Updated", description: "Submission marked as read." });
  };

  const handleLogin = () => {
    initiateAnonymousSignIn(auth);
  };

  const filteredSubmissions = submissions?.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050406] text-white p-6 md:p-12 font-body selection:bg-accent selection:text-black">
      {/* Background HUD Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent/10 rounded-lg border border-accent/20">
                <Shield className="text-accent w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">Command <span className="text-accent">Center</span></h1>
            </div>
            <p className="text-white/40 font-code text-[10px] tracking-[0.4em] uppercase">Mix Aura Intelligence Unit</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
              <Input 
                placeholder="FILTER TRANSMISSIONS..." 
                className="bg-white/5 border-white/10 pl-10 h-10 w-full md:w-64 font-code text-[10px] rounded-lg focus:border-accent/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {!user && (
              <Button onClick={handleLogin} variant="outline" className="border-accent/30 text-accent hover:bg-accent/10 font-code text-[10px] h-10 rounded-lg">
                <LogIn size={14} className="mr-2" /> AUTHENTICATE
              </Button>
            )}
            {user && (
               <Badge variant="outline" className="border-accent/50 text-accent font-code py-1.5 px-3">
                  AGENT_{user.uid.substring(0,6).toUpperCase()}
               </Badge>
            )}
          </div>
        </header>

        {error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
             <Shield className="w-16 h-16 text-destructive mb-4 animate-pulse" />
             <h2 className="text-2xl font-black mb-2 uppercase">Access Denied</h2>
             <p className="text-white/40 font-code text-center max-w-sm">
                Your credentials are not authorized to access internal communications. 
                Contact the system architect for higher clearance.
             </p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-20">
             <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin shadow-[0_0_20px_#a855f7]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {filteredSubmissions?.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 text-white/20 font-code uppercase tracking-widest"
                >
                  No intercepted transmissions found.
                </motion.div>
              ) : (
                filteredSubmissions?.map((sub, index) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-white/5 border-white/10 hover:border-accent/30 transition-all duration-300 group overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                             <Mail className="text-accent w-4 h-4" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-black uppercase text-white tracking-tight">
                              {sub.name}
                            </CardTitle>
                            <div className="flex items-center gap-3 text-white/40 text-[10px] font-code mt-1">
                              <span className="flex items-center gap-1"><Mail size={10} /> {sub.email}</span>
                              <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(sub.submissionDateTime).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {sub.status === 'new' && (
                            <Badge className="bg-accent text-black font-black text-[8px] animate-pulse">NEW</Badge>
                          )}
                          <Button 
                            onClick={() => markAsRead(sub.id)}
                            variant="ghost" 
                            size="icon" 
                            className="text-white/20 hover:text-accent hover:bg-accent/10"
                            disabled={sub.status === 'read'}
                          >
                            <CheckCircle size={16} />
                          </Button>
                          <Button 
                            onClick={() => handleDelete(sub.id)}
                            variant="ghost" 
                            size="icon" 
                            className="text-white/20 hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5 mt-2">
                          <p className="text-white/80 text-xs leading-relaxed font-body italic">
                            "{sub.message}"
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}

        <footer className="mt-20 pt-10 border-t border-white/5 flex justify-between items-center text-[8px] font-code text-white/20 uppercase tracking-[0.5em]">
           <span>Terminal_V1.0.2</span>
           <span>Mix Aura Admin Protocol</span>
           <span>Encrypted Session</span>
        </footer>
      </div>
    </div>
  );
}
