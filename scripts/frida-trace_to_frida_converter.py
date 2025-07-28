import os
import re

script_dir = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.abspath(os.path.join(script_dir, '..', 'poc_templates', 'frida-trace'))
DST_DIR = os.path.abspath(os.path.join(script_dir, '..', 'poc_templates', 'frida'))



pattern_lapsDLL = re.compile(r'^(\w+)_lapsDLL_\w+\.js$')
pattern_dll_function = re.compile(r'^(\w+)_(\w+DLL)_(\w+)\.js$')

template_lapsDLL = '''const offset = OFFSETVALUE; // Update me - offset to the target function

const moduleName = 'laps.dll';
const targetModule = Process.enumerateModules().find(mod => mod.name.toLowerCase().includes(moduleName.toLowerCase()));

if (targetModule !== undefined) {{
    const baseAddr = targetModule.base;
    const targetFuncAddr = baseAddr.add(offset);
    console.log(`[+] Base address of ${{moduleName}}: ${{baseAddr}}`);   
    console.log(`[+] Hooking function at ${{targetFuncAddr}} (offset 0x${{offset.toString(16)}})`);

    Interceptor.attach(targetFuncAddr, {{
        onEnter: function (args) {{
{on_enter_code}
        }},
        onLeave: function (retval) {{
{on_leave_code}
        }}
    }});

}} else {{
    console.error(`[-] Could not find base address for ${{moduleName}}`);
}}
'''

template_moduleDLL = '''const moduleName = '{moduleName}';
const targetFunctionName = '{functionName}'

const targetModule = Process.enumerateModules().find(mod => mod.name.toLowerCase().includes(moduleName.toLowerCase()));

if (targetModule !== undefined) {{
    const baseAddr = targetModule.base;
    const targetFuncAddr = targetModule.getExportByName(targetFunctionName);
    console.log(`[+] Base address of ${{moduleName}}: ${{baseAddr}}`);
    console.log(`[+] Hooking function ${{targetFunctionName}} at address: ${{targetFuncAddr}}`);

    Interceptor.attach(targetFuncAddr, {{
        onEnter: function (args) {{
{on_enter_code}
        }},
        onLeave: function (retval) {{
{on_leave_code}
        }}
    }});
}} else {{
    console.error(`[-] Could not find base address for ${{moduleName}}`);
}}
'''

def extract_function_body(text, func_name):
    pattern = re.compile(rf'{func_name}\s*\([^\)]*\)\s*\{{', re.MULTILINE)
    m = pattern.search(text)
    if not m:
        return None
    start = m.end()
    brace_count = 1
    pos = start
    while pos < len(text):
        if text[pos] == '{':
            brace_count += 1
        elif text[pos] == '}':
            brace_count -= 1
            if brace_count == 0:
                return text[start:pos].strip()
        pos += 1
    return None

def replace_log_calls(code):
    return re.sub(r'\blog\s*\(', 'console.log(', code)

def indent_code(code, spaces=12):
    indentation = ' ' * spaces
    lines = code.strip().splitlines()
    return '\n'.join(indentation + line for line in lines)

def main():
    if not os.path.exists(DST_DIR):
        os.makedirs(DST_DIR)

    for filename in os.listdir(SRC_DIR):
        laps_match = pattern_lapsDLL.match(filename)
        dllfunc_match = pattern_dll_function.match(filename)

        if laps_match:
            filepath = os.path.join(SRC_DIR, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            on_enter_code = extract_function_body(content, 'onEnter') or '// onEnter code not found'
            on_leave_code = extract_function_body(content, 'onLeave') or '// onLeave code not found'

            on_enter_code = replace_log_calls(on_enter_code)
            on_leave_code = replace_log_calls(on_leave_code)

            on_enter_code_indented = indent_code(on_enter_code)
            on_leave_code_indented = indent_code(on_leave_code)

            final_js = template_lapsDLL.format(
                on_enter_code=on_enter_code_indented,
                on_leave_code=on_leave_code_indented
            )

        elif dllfunc_match:
            module_part = dllfunc_match.group(2)
            function_part = dllfunc_match.group(3)

            module_name_base = re.sub(r'dll$', '', module_part, flags=re.IGNORECASE).lower()
            moduleName = f'{module_name_base}.dll'
            functionName = function_part

            filepath = os.path.join(SRC_DIR, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            on_enter_code = extract_function_body(content, 'onEnter') or '// onEnter code not found'
            on_leave_code = extract_function_body(content, 'onLeave') or '// onLeave code not found'

            on_enter_code = replace_log_calls(on_enter_code)
            on_leave_code = replace_log_calls(on_leave_code)

            on_enter_code_indented = indent_code(on_enter_code)
            on_leave_code_indented = indent_code(on_leave_code)

            final_js = template_moduleDLL.format(
                moduleName=moduleName,
                functionName=functionName,
                on_enter_code=on_enter_code_indented,
                on_leave_code=on_leave_code_indented
            )
        else:
            print(f'Skipping unmatched file: {filename}')
            continue

        out_path = os.path.join(DST_DIR, filename)
        with open(out_path, 'w', encoding='utf-8') as f_out:
            f_out.write(final_js)

        print(f'Processed {filename} -> {out_path}')

if __name__ == '__main__':
    main()
