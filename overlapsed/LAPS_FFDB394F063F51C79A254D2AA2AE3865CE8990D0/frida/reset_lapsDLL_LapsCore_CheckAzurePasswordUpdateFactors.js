const offset = 0x1c4dc; // Update me - offset to the target function

const moduleName = 'laps.dll';
const targetModule = Process.enumerateModules().find(mod => mod.name.toLowerCase().includes(moduleName.toLowerCase()));

if (targetModule !== undefined) {
    const baseAddr = targetModule.base;
    const targetFuncAddr = baseAddr.add(offset);
    console.log(`[+] Base address of ${moduleName}: ${baseAddr}`);   
    console.log(`[+] Hooking function at ${targetFuncAddr} (offset 0x${offset.toString(16)})`);

    Interceptor.attach(targetFuncAddr, {
        onEnter: function (args) {
            console.log('[RESET] LapsCore::CheckAzurePasswordUpdateFactors');
                    this.arg5 = args[5];
        },
        onLeave: function (retval) {
            console.log('Leaving LapsCore::CheckAzurePasswordUpdateFactors - Forcing update');
                    this.arg5.writeULong(1);
        }
    });

} else {
    console.error(`[-] Could not find base address for ${moduleName}`);
}

