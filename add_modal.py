import os

file_path = r'c:\Users\acer\Documents\GitHub\Ecelldypiu.in-maru\src\components\CertificateManager.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Send to lucide-react imports
if 'Send' not in content[:1000]:
    content = content.replace('Users, Search, CheckSquare, XSquare\n}', 'Users, Search, CheckSquare, XSquare, Send\n}')

# 2. Add showDispatchConfirm state
state_target = "const [emailProvider, setEmailProvider] = useState('resend');"
state_insert = "\n    const [showDispatchConfirm, setShowDispatchConfirm] = useState(false);"
if 'showDispatchConfirm' not in content:
    content = content.replace(state_target, state_target + state_insert)

# 3. Add the modal
modal_target = "{/* Add Manual Attendee Modal */}"
modal_code = """{/* Dispatch Confirmation Modal */}
            {showDispatchConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border-4 border-zinc-700 p-6 rounded-2xl max-w-2xl w-full shadow-2xl relative max-h-[90vh] flex flex-col">
                        <button 
                            onClick={() => setShowDispatchConfirm(false)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        
                        <h4 className="text-white font-black text-2xl uppercase mb-2 flex items-center gap-2">
                            <Send className="w-6 h-6 text-brand-yellow" /> Confirm Dispatch
                        </h4>
                        <p className="text-zinc-400 mb-6">
                            Are you sure you want to send certificates to the following <strong className="text-white">{eventAttendees.filter(a => eligibility[(a.email || '').trim().toLowerCase()]?.eligible === true).length}</strong> participants?
                        </p>
                        
                        <div className="flex-1 overflow-y-auto border-2 border-zinc-800 rounded-xl mb-6 bg-black/50 p-2">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-zinc-900 z-10">
                                    <tr className="text-left">
                                        <th className="px-4 py-2 text-zinc-400 font-bold uppercase text-xs">Name</th>
                                        <th className="px-4 py-2 text-zinc-400 font-bold uppercase text-xs">Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventAttendees
                                        .filter(a => eligibility[(a.email || '').trim().toLowerCase()]?.eligible === true)
                                        .map((attendee, idx) => (
                                            <tr key={idx} className="border-t border-zinc-800/50">
                                                <td className="px-4 py-2 text-white">{attendee.name || '—'}</td>
                                                <td className="px-4 py-2 font-mono text-zinc-400">{attendee.email || '—'}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4 border-t-2 border-zinc-800">
                            <button
                                onClick={() => setShowDispatchConfirm(false)}
                                className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowDispatchConfirm(false);
                                    handleDispatch();
                                }}
                                className="bg-brand-yellow text-black font-black px-6 py-3 rounded-xl hover:shadow-[4px_4px_0px_white] transition-all uppercase flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" /> Yes, Send Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            """

if '{/* Dispatch Confirmation Modal */}' not in content:
    content = content.replace(modal_target, modal_code + modal_target)

# 4. Replace onClick in the Dispatch tab
# We need to replace exactly the buttons that trigger dispatch.
# Let's find "onClick={handleDispatch}" that are near "Dispatch Now" or "disabled={dispatching || eventAttendees.length === 0}"
btn_target_1 = """onClick={handleDispatch}
                                disabled={dispatching || eventAttendees.length === 0}
                                className="bg-brand-yellow text-black font-black px-6 py-3 rounded-xl border-4 border-white hover:shadow-[6px_6px_0px_white] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex items-center gap-2 whitespace-nowrap"
                            >"""

btn_replace_1 = """onClick={() => setShowDispatchConfirm(true)}
                                disabled={dispatching || eventAttendees.length === 0}
                                className="bg-brand-yellow text-black font-black px-6 py-3 rounded-xl border-4 border-white hover:shadow-[6px_6px_0px_white] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex items-center gap-2 whitespace-nowrap"
                            >"""

btn_target_2 = """onClick={handleDispatch}
                                disabled={dispatching || eventAttendees.length === 0}
                                className="bg-brand-yellow text-black font-black px-8 py-4 rounded-xl border-4 border-white hover:shadow-[6px_6px_0px_white] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex items-center gap-2"
                            >"""

btn_replace_2 = """onClick={() => setShowDispatchConfirm(true)}
                                disabled={dispatching || eventAttendees.length === 0}
                                className="bg-brand-yellow text-black font-black px-8 py-4 rounded-xl border-4 border-white hover:shadow-[6px_6px_0px_white] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex items-center gap-2"
                            >"""

content = content.replace(btn_target_1, btn_replace_1)
content = content.replace(btn_target_2, btn_replace_2)

# Handle CRLF
btn_target_1_crlf = btn_target_1.replace('\n', '\r\n')
btn_replace_1_crlf = btn_replace_1.replace('\n', '\r\n')
btn_target_2_crlf = btn_target_2.replace('\n', '\r\n')
btn_replace_2_crlf = btn_replace_2.replace('\n', '\r\n')

content = content.replace(btn_target_1_crlf, btn_replace_1_crlf)
content = content.replace(btn_target_2_crlf, btn_replace_2_crlf)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done adding modal.")
