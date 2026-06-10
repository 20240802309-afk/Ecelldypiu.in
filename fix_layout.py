import os

file_path = r'c:\Users\acer\Documents\GitHub\Ecelldypiu.in-maru\src\components\CertificateManager.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Exact strings
start_str = '                    {/* Attendee Eligibility Section - Full Width */}'
end_str = '''                            )}
                        </div>
                    </div>'''

if start_str not in content:
    start_str = start_str.replace('\n', '\r\n')
    end_str = end_str.replace('\n', '\r\n')

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx) + len(end_str)

block = content[start_idx:end_idx]

# Remove the block
content = content[:start_idx] + content[end_idx:]

# Find dispatch start
dispatch_target = "{selectedEvent && !loading && managerTab === 'dispatch' && ("
dispatch_idx = content.find(dispatch_target)

# Find the next div
next_div_idx = content.find('<div className="bg-zinc-900 border-4 border-zinc-700 rounded-2xl p-6">', dispatch_idx)

# Modify block to have mb-6
block = block.replace('className="lg:col-span-5 mt-6"', 'className="mb-6"')

# Insert wrapper and block
insert_payload = '\n                <div className="space-y-6">\n' + block + '\n                '

content = content[:next_div_idx] + insert_payload + content[next_div_idx:]

# Find the end of the dispatch tab to close space-y-6
# It ends with:
#                 </div>
#             )}
#         </>
#     )}

dispatch_end_target = '''                </div>
            )}
        </>'''

if dispatch_end_target not in content:
    dispatch_end_target = dispatch_end_target.replace('\n', '\r\n')

end_insert_idx = content.find(dispatch_end_target)
content = content[:end_insert_idx] + '                    </div>\n' + content[end_insert_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Success")
