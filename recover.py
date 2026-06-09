import json

with open('recovery_log.json', 'r', encoding='utf-8') as f:
    changes = json.load(f)

with open('src/components/CertificateManager.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

applied = 0
failed = 0

def clean_str(s):
    if isinstance(s, str):
        if s.startswith('"') and s.endswith('"'):
            try:
                return json.loads(s)
            except:
                pass
    return s

for tc in changes:
    args = tc.get('args', {})
    
    if tc['name'] == 'replace_file_content':
        target = clean_str(args.get('TargetContent', ''))
        replacement = clean_str(args.get('ReplacementContent', ''))
        if target in content:
            content = content.replace(target, replacement, 1)
            applied += 1
            print("Applied single!")
        else:
            failed += 1
            print('Failed single:', repr(target)[:50])
            
    elif tc['name'] == 'multi_replace_file_content':
        chunks_str = args.get('ReplacementChunks', '')
        if isinstance(chunks_str, str):
            try:
                chunks = json.loads(chunks_str)
            except:
                print('Failed to parse chunks array')
                continue
        else:
            chunks = chunks_str
            
        for chunk in chunks:
            if not isinstance(chunk, dict): continue
            target = clean_str(chunk.get('TargetContent', ''))
            replacement = clean_str(chunk.get('ReplacementContent', ''))
            if target in content:
                content = content.replace(target, replacement, 1)
                applied += 1
                print("Applied chunk!")
            else:
                failed += 1
                print('Failed chunk:', repr(target)[:50])

print(f'Applied {applied}, failed {failed}')
with open('src/components/CertificateManager_recovered.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
