# CampusFind

Campus Lost & Found Tracker — DevOps Final Capstone.

A 3-tier application (React frontend, FastAPI backend, PostgreSQL) serving as the vehicle for comprehensive DevOps practices: Docker containerization, GitHub Actions CI/CD, Trivy vulnerability scanning, Terraform Infrastructure as Code on AWS, Kubernetes deployment with Helm, and Prometheus/Grafana observability.

## Troubleshooting Lab

This section documents real-world failure diagnosis and recovery executed in an isolated `troubleshooting-lab` namespace on the local Kubernetes cluster.

### Scenario 1: Pod Stuck in `ImagePullBackOff`

#### 1. Symptom
A newly deployed backend pod fails to start and enters an `ErrImagePull` state, quickly escalating into an exponential back-off cycle (`ImagePullBackOff`).

```text
$ kubectl get pods -n troubleshooting-lab
NAME                                       READY   STATUS             RESTARTS   AGE
campusfind-broken-image-644bbcd496-pjp7n   0/1     ImagePullBackOff   0          25s
```

#### 2. Commands Used
```bash
# Check pod status and restart count
kubectl get pods -n troubleshooting-lab

# Inspect detailed container lifecycle and kubelet event stream
kubectl describe pod -l app=campusfind-broken-image -n troubleshooting-lab

# Verify recent cluster events chronologically
kubectl get events -n troubleshooting-lab --sort-by='.metadata.creationTimestamp'
```

**Real Output (`kubectl describe pod`):**
```text
Containers:
  backend:
    Image:          ghcr.io/kavya100206/campusfind-backend:nonexistent-tag
    State:          Waiting
      Reason:       ErrImagePull
    Ready:          False
...
Events:
  Type     Reason     Age   From               Message
  ----     ------     ----  ----               -------
  Normal   Scheduled  15s   default-scheduler  Successfully assigned troubleshooting-lab/campusfind-broken-image-644bbcd496-pjp7n to campusfind-control-plane
  Normal   Pulling    14s   kubelet            spec.containers{backend}: Pulling image "ghcr.io/kavya100206/campusfind-backend:nonexistent-tag"
  Warning  Failed     13s   kubelet            spec.containers{backend}: Failed to pull image "ghcr.io/kavya100206/campusfind-backend:nonexistent-tag": rpc error: code = NotFound desc = failed to pull and unpack image "ghcr.io/kavya100206/campusfind-backend:nonexistent-tag": failed to resolve reference "ghcr.io/kavya100206/campusfind-backend:nonexistent-tag": ghcr.io/kavya100206/campusfind-backend:nonexistent-tag: not found
  Warning  Failed     13s   kubelet            spec.containers{backend}: Error: ErrImagePull
  Normal   BackOff    13s   kubelet            spec.containers{backend}: Back-off pulling image "ghcr.io/kavya100206/campusfind-backend:nonexistent-tag"
  Warning  Failed     13s   kubelet            spec.containers{backend}: Error: ImagePullBackOff
```

#### 3. Root Cause
The deployment container specification targeted a non-existent tag `ghcr.io/kavya100206/campusfind-backend:nonexistent-tag`. The container runtime (`containerd` via `kubelet`) queried GitHub Packages (GHCR), received an HTTP 404 (`NotFound: not found`), and backed off pulling the image.

#### 4. Fix & Verification
Update the deployment image to the valid, immutable commit SHA published to GHCR:
```bash
kubectl set image deployment/campusfind-broken-image backend=ghcr.io/kavya100206/campusfind-backend:ce0cbedd6efc38f5b528ae12eed42518445201d9 -n troubleshooting-lab
```

**Real Output Verification:**
```text
$ kubectl get pods -n troubleshooting-lab
NAME                                       READY   STATUS    RESTARTS   AGE
campusfind-broken-image-7d7d779745-7xmv4   1/1     Running   0          6s
```

---

### Scenario 2: Service with Missing Endpoints (`<none>`)

#### 1. Symptom
The `campusfind-broken-service` Service exists and is assigned a ClusterIP, but incoming requests fail and return connection timeouts or connection refused. Listing endpoints shows `<none>`.

```text
$ kubectl get endpoints -n troubleshooting-lab
NAME                        ENDPOINTS   AGE
campusfind-broken-service   <none>      31s
```

#### 2. Commands Used
```bash
# Check service configuration and selector
kubectl get svc -n troubleshooting-lab -o wide

# Check endpoints registered to the service
kubectl get endpoints -n troubleshooting-lab

# Describe the service details and events
kubectl describe svc campusfind-broken-service -n troubleshooting-lab

# Inspect actual pod labels in the namespace
kubectl get pods -n troubleshooting-lab --show-labels
```

**Real Output (`kubectl describe svc` & `kubectl get pods --show-labels`):**
```text
$ kubectl describe svc campusfind-broken-service -n troubleshooting-lab
Name:                     campusfind-broken-service
Namespace:                troubleshooting-lab
Selector:                 app=campusfind-wrong-selector
Type:                     ClusterIP
IP:                       10.96.106.17
Port:                     http  8000/TCP
TargetPort:               8000/TCP
Endpoints:                

$ kubectl get pods -n troubleshooting-lab --show-labels
NAME                                       READY   STATUS    RESTARTS   AGE   LABELS
campusfind-backend-test-6d7dd56dfc-ndfxg   1/1     Running   0          5s    app=campusfind-backend,pod-template-hash=6d7dd56dfc
```

#### 3. Root Cause
There is a label selector mismatch. The Service was configured with `spec.selector.app: campusfind-wrong-selector`, while the backend Pod has `metadata.labels.app: campusfind-backend`. Because the selector matched zero pods, the Kubernetes EndpointSlice controller did not attach any target pod IP addresses to the Service.

#### 4. Fix & Verification
Patch the Service's selector to match the target Pod's actual label:
```bash
kubectl patch svc campusfind-broken-service -n troubleshooting-lab -p '{"spec":{"selector":{"app":"campusfind-backend"}}}'
```

**Real Output Verification:**
```text
$ kubectl get endpoints campusfind-broken-service -n troubleshooting-lab
NAME                        ENDPOINTS          AGE
campusfind-broken-service   10.244.0.23:8000   61s

$ kubectl get endpointslices -l kubernetes.io/service-name=campusfind-broken-service -n troubleshooting-lab
NAME                              ADDRESSTYPE   PORTS   ENDPOINTS     AGE
campusfind-broken-service-rkrg5   IPv4          8000    10.244.0.23   70s
```
The Service immediately registered the healthy pod endpoint (`10.244.0.23:8000`), restoring cluster-internal network routing.

