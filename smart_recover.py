import json
import re

def apply_replacement(target, replacement, text):
    # Try exact match
    if target in text:
        print("Applied exact match")
        return text.replace(target, replacement, 1)
        
    # Try with strict newline/whitespace normalization
    def norm_all(s):
        return re.sub(r'\s+', ' ', s).strip()
        
    text_norm = norm_all(text)
    target_norm = norm_all(target)
    
    if target_norm in text_norm:
        words = target_norm.split(' ')
        if not words: return text
        regex_pattern = r'\s+'.join(re.escape(word) for word in words)
        match = re.search(regex_pattern, text)
        if match:
            print("Applied fuzzy match")
            return text[:match.start()] + replacement + text[match.end():]

    print("Failed to match target")
    print("Target snippet:", repr(target)[:100])
    return text

with open('recovery_log.json', 'r', encoding='utf-8') as f:
    changes = json.load(f)

with open('src/components/CertificateManager.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

for tc in changes:
    args = tc.get('args', {})
    
    if tc['name'] == 'replace_file_content':
        target = args.get('TargetContent', '')
        replacement = args.get('ReplacementContent', '')
        
        if isinstance(target, str) and target.startswith('"') and target.endswith('"'):
            try: target = json.loads(target, strict=False)
            except: pass
        if isinstance(replacement, str) and replacement.startswith('"') and replacement.endswith('"'):
            try: replacement = json.loads(replacement, strict=False)
            except: pass
            
        content = apply_replacement(target, replacement, content)
        
    elif tc['name'] == 'multi_replace_file_content':
        chunks_str = args.get('ReplacementChunks', '')
        chunks = None
        if isinstance(chunks_str, str):
            if chunks_str.startswith('"') and chunks_str.endswith('"'):
                try: chunks_str = json.loads(chunks_str, strict=False)
                except: pass
            try:
                chunks = json.loads(chunks_str, strict=False)
            except Exception as e:
                import ast
                try:
                    # In case of python repr instead of json
                    chunks = ast.literal_eval(chunks_str)
                except Exception as e2:
                    print("Could not parse chunks:", str(e))
        else:
            chunks = chunks_str
            
        if not chunks: continue
        
        for chunk in chunks:
            if not isinstance(chunk, dict): continue
            target = chunk.get('TargetContent', '')
            replacement = chunk.get('ReplacementContent', '')
            content = apply_replacement(target, replacement, content)

with open('src/components/CertificateManager_smart_recovered.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Finished recovery")
