package com.homeputers.ebal2.api.domain.serviceplanitem;

import com.homeputers.ebal2.api.domain.service.Service;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "service_plan_items")
public record ServicePlanItem(
        @Id
        UUID id,

        @ManyToOne
        @JoinColumn(name = "service_id")
        Service service,

        String type,

        @Column(name = "ref_id")
        UUID refId,

        @Column(name = "\"order\"")
        Integer sortOrder,

        String notes
) {
    public ServicePlanItem() {
        this(null, null, null, null, null, null);
    }

    public ServicePlanItem {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ServicePlanItem that = (ServicePlanItem) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

