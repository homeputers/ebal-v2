package com.homeputers.ebal2.api.serviceplanitem;

import com.homeputers.ebal2.api.domain.service.Service;
import com.homeputers.ebal2.api.domain.serviceplanitem.ServicePlanItem;
import com.homeputers.ebal2.api.domain.serviceplanitem.ServicePlanItemMapper;
import com.homeputers.ebal2.api.generated.model.ServicePlanItemRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ServicePlanItemServiceTest {

    @Mock
    private ServicePlanItemMapper mapper;

    @InjectMocks
    private ServicePlanItemService service;

    @Test
    void update_keeps_existing_fields_when_request_omits_them() {
        UUID id = UUID.randomUUID();
        Service serviceEntity = new Service(UUID.randomUUID(), OffsetDateTime.now(), "Main Hall");
        ServicePlanItem existing = new ServicePlanItem(
                id,
                serviceEntity,
                "song",
                UUID.randomUUID(),
                0,
                "existing notes"
        );

        when(mapper.findById(id)).thenReturn(existing);

        ServicePlanItemRequest request = new ServicePlanItemRequest();
        request.setNotes("");

        ServicePlanItem updated = service.update(id, request);

        assertThat(updated.type()).isEqualTo(existing.type());
        assertThat(updated.refId()).isEqualTo(existing.refId());
        assertThat(updated.sortOrder()).isEqualTo(existing.sortOrder());
        assertThat(updated.notes()).isEmpty();

        verify(mapper).update(updated);
    }
}
