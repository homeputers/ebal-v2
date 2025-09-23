package com.homeputers.ebal2.api.admin.user;

public class LastAdminRemovalException extends RuntimeException {
    public static final String ERROR_CODE = "LAST_ADMIN_FORBIDDEN";

    public LastAdminRemovalException() {
        super("Cannot remove the last administrator account.");
    }
}
